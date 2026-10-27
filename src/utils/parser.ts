import * as XLSX from 'xlsx';
import {
  ParsedStudentRow,
  StudentAccount,
  UploadMode,
  BatchUploadSummary,
} from '../types';
import {
  findMatchingStudent,
  generateEmail,
  generateStudentId,
  generateTempPassword,
  normalizeName,
} from './matching';

// Common non-subject keys to exclude when detecting subjects
const NON_SUBJECT_KEYS = new Set([
  'id',
  'studentid',
  'student_id',
  'student id',
  'admissionno',
  'admission_no',
  'admission no',
  'admno',
  'adm_no',
  'adm no',
  'regno',
  'reg_no',
  'reg no',
  'name',
  'fullname',
  'full_name',
  'full name',
  'studentname',
  'student_name',
  'student name',
  'candidatename',
  'firstname',
  'first_name',
  'first name',
  'lastname',
  'last_name',
  'last name',
  'surname',
  'gender',
  'sex',
  'class',
  'classname',
  'class_name',
  'class name',
  'grade',
  'form',
  'arm',
  'email',
  'studentemail',
  'student_email',
  'parentemail',
  'parent_email',
  'parent email',
  'guardianemail',
  'guardian_email',
  'phone',
  'total',
  'totalscore',
  'total_score',
  'total score',
  'average',
  'averagescore',
  'average_score',
  'average score',
  'percentage',
  'rank',
  'position',
  'grade_letter',
  'remarks',
  'remark',
  'status',
  'comments',
]);

export function detectDelimiter(text: string): string {
  const firstLine = text.split('\n')[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  if (semiCount > commaCount && semiCount > tabCount) return ';';
  return ',';
}

export function parseCSVToObjects(csvText: string): Record<string, any>[] {
  const delimiter = detectDelimiter(csvText);
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Parse header line handling potential quotes
  const headers = parseLineTokens(lines[0], delimiter).map((h) =>
    h.trim().replace(/^["']|["']$/g, '')
  );

  const results: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLineTokens(lines[i], delimiter);
    if (values.length === 0 || values.every((v) => !v.trim())) continue;

    const rowObj: Record<string, any> = {};
    headers.forEach((header, idx) => {
      let val = values[idx] !== undefined ? values[idx].trim() : '';
      val = val.replace(/^["']|["']$/g, '');
      rowObj[header] = val;
    });
    results.push(rowObj);
  }

  return results;
}

function parseLineTokens(line: string, delimiter: string): string[] {
  const tokens: string[] = [];
  let cur = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      tokens.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  tokens.push(cur);
  return tokens;
}

export function parseExcelBuffer(buffer: ArrayBuffer): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const allRows: Record<string, any>[] = [];

  // Iterate all sheets so multi-sheet workbooks (e.g. 1 sheet per class) work seamlessly!
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false,
    });
    sheetData.forEach((row) => {
      // If row doesn't have an explicit class, use sheetName as fallback class
      if (!row['Class'] && !row['class'] && !row['Grade'] && !row['grade']) {
        row['Class'] = sheetName;
      }
      allRows.push(row);
    });
  });

  return allRows;
}

export function parseJSONData(jsonText: string): Record<string, any>[] {
  const parsed = JSON.parse(jsonText);

  // Case 1: Array of student rows
  if (Array.isArray(parsed)) {
    return parsed;
  }

  // Case 2: Object with 'students' array or 'records' or 'results'
  if (Array.isArray(parsed.students)) return parsed.students;
  if (Array.isArray(parsed.records)) return parsed.records;
  if (Array.isArray(parsed.results)) return parsed.results;

  // Case 3: Nested classes object e.g. { classes: [ { className: "10A", students: [...] } ] }
  if (Array.isArray(parsed.classes)) {
    const flattened: Record<string, any>[] = [];
    parsed.classes.forEach((cls: any) => {
      const clsName = cls.className || cls.name || cls.class || 'Unknown Class';
      const studentList = cls.students || cls.records || [];
      if (Array.isArray(studentList)) {
        studentList.forEach((st: any) => {
          flattened.push({
            ...st,
            Class: st.class || st.Class || clsName,
          });
        });
      }
    });
    return flattened;
  }

  // Case 4: Keyed by class name: { "Grade 10A": [ ... ], "Grade 10B": [ ... ] }
  const keys = Object.keys(parsed);
  if (keys.length > 0 && Array.isArray(parsed[keys[0]])) {
    const flattened: Record<string, any>[] = [];
    keys.forEach((className) => {
      parsed[className].forEach((st: any) => {
        flattened.push({
          ...st,
          Class: st.class || st.Class || className,
        });
      });
    });
    return flattened;
  }

  throw new Error('Unsupported JSON format. Provide an array of student records or a { classes: [...] } structure.');
}

export function processUploadedData(
  records: Record<string, any>[],
  existingStudents: StudentAccount[],
  config: {
    fileName: string;
    fileSize: number;
    uploadMode: UploadMode;
    selectedClass?: string;
    academicSession: string;
    term: string;
    examName: string;
    autoProvisionAccounts: boolean;
  }
): BatchUploadSummary {
  const parsedRows: ParsedStudentRow[] = [];
  const classesDetectedSet = new Set<string>();
  const subjectsDetectedSet = new Set<string>();

  let idCounter = existingStudents.length + 101;

  records.forEach((raw, index) => {
    const rowNumber = index + 1;
    const validationErrors: string[] = [];

    // 1. Identify Name
    let fullName = '';
    const keys = Object.keys(raw);

    // Look for full name or composite first+last name
    for (const k of keys) {
      const cleanK = k.toLowerCase().replace(/[\s\-_]/g, '');
      if (['fullname', 'name', 'studentname', 'candidatename', 'pupilname'].includes(cleanK)) {
        fullName = String(raw[k] || '').trim();
        break;
      }
    }

    if (!fullName) {
      // Check first name + last name
      let first = '';
      let last = '';
      for (const k of keys) {
        const cleanK = k.toLowerCase().replace(/[\s\-_]/g, '');
        if (cleanK === 'firstname' || cleanK === 'first') first = String(raw[k] || '').trim();
        if (cleanK === 'lastname' || cleanK === 'last' || cleanK === 'surname') last = String(raw[k] || '').trim();
      }
      if (first || last) {
        fullName = `${first} ${last}`.trim();
      }
    }

    if (!fullName) {
      validationErrors.push('Missing student name');
    }

    // 2. Identify Student ID / Admission Number
    let studentId: string | undefined = undefined;
    for (const k of keys) {
      const cleanK = k.toLowerCase().replace(/[\s\-_]/g, '');
      if (
        ['studentid', 'id', 'admissionno', 'admno', 'regno', 'matricno', 'student_id'].includes(
          cleanK
        )
      ) {
        const val = String(raw[k] || '').trim();
        if (val) {
          studentId = val;
          break;
        }
      }
    }

    // 3. Identify Class
    let className = '';
    if (config.uploadMode === 'single-class' && config.selectedClass) {
      className = config.selectedClass;
    } else {
      for (const k of keys) {
        const cleanK = k.toLowerCase().replace(/[\s\-_]/g, '');
        if (['class', 'classname', 'grade', 'form', 'arm', 'classroom'].includes(cleanK)) {
          className = String(raw[k] || '').trim();
          break;
        }
      }
      if (!className && config.selectedClass) {
        className = config.selectedClass;
      }
    }

    if (!className) {
      validationErrors.push('Class not specified (provide a Class column or select target class)');
      className = 'Unassigned';
    } else {
      classesDetectedSet.add(className);
    }

    // 4. Identify Gender, Email, Parent Email
    let gender: string | undefined = undefined;
    let email: string | undefined = undefined;
    let parentEmail: string | undefined = undefined;
    let remarks: string | undefined = undefined;

    for (const k of keys) {
      const cleanK = k.toLowerCase().replace(/[\s\-_]/g, '');
      if (['gender', 'sex'].includes(cleanK)) {
        const g = String(raw[k] || '').trim();
        if (/^m/i.test(g)) gender = 'Male';
        else if (/^f/i.test(g)) gender = 'Female';
        else if (g) gender = g;
      } else if (cleanK === 'email' || cleanK === 'studentemail') {
        const em = String(raw[k] || '').trim();
        if (em.includes('@')) email = em;
      } else if (cleanK === 'parentemail' || cleanK === 'guardianemail') {
        const pem = String(raw[k] || '').trim();
        if (pem.includes('@')) parentEmail = pem;
      } else if (cleanK === 'remarks' || cleanK === 'remark' || cleanK === 'comments') {
        remarks = String(raw[k] || '').trim();
      }
    }

    // 5. Detect and Extract Subject Scores
    const subjects: Record<string, number> = {};
    keys.forEach((k) => {
      const cleanK = k.toLowerCase().trim();
      const strippedK = cleanK.replace(/[\s\-_]/g, '');

      if (!NON_SUBJECT_KEYS.has(cleanK) && !NON_SUBJECT_KEYS.has(strippedK)) {
        const rawVal = raw[k];
        if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
          const num = Number(rawVal);
          if (!isNaN(num)) {
            // Standardize subject label: capitalize words
            const formattedSubject = k
              .trim()
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            subjects[formattedSubject] = num;
            subjectsDetectedSet.add(formattedSubject);

            if (num < 0 || num > 100) {
              validationErrors.push(`Score for ${formattedSubject} (${num}) out of range (0-100)`);
            }
          }
        }
      }
    });

    if (Object.keys(subjects).length === 0) {
      validationErrors.push('No subject scores detected in this row');
    }

    // Calculate total and average
    const scoreValues = Object.values(subjects);
    const totalScore = scoreValues.reduce((sum, val) => sum + val, 0);
    const averageScore = scoreValues.length > 0 ? Math.round((totalScore / scoreValues.length) * 10) / 10 : 0;

    // 6. Match with existing database accounts
    let matchType: 'existing' | 'new_account' | 'conflict' | 'invalid' = 'new_account';
    let matchedStudent: StudentAccount | undefined = undefined;

    if (validationErrors.length > 0 && !fullName) {
      matchType = 'invalid';
    } else {
      matchedStudent = findMatchingStudent(
        {
          studentId,
          fullName,
          className,
        },
        existingStudents
      );

      if (matchedStudent) {
        matchType = 'existing';
      } else {
        matchType = 'new_account';
      }
    }

    // Provision details for new accounts
    let generatedStudentId: string | undefined;
    let generatedTempPassword: string | undefined;
    let generatedEmail: string | undefined;

    if (matchType === 'new_account') {
      idCounter++;
      generatedStudentId = studentId || generateStudentId(idCounter);
      generatedTempPassword = generateTempPassword();
      generatedEmail = email || generateEmail(fullName, generatedStudentId);
    }

    parsedRows.push({
      rowNumber,
      rawRecord: raw,
      studentId: matchedStudent?.studentId || studentId || generatedStudentId,
      fullName,
      gender: gender || matchedStudent?.gender,
      className,
      email: email || matchedStudent?.email || generatedEmail,
      parentEmail: parentEmail || matchedStudent?.parentEmail,
      subjects,
      totalScore,
      averageScore,
      remarks,
      matchType,
      matchedStudent,
      validationErrors,
      generatedStudentId,
      generatedTempPassword,
      generatedEmail,
    });
  });

  const validRows = parsedRows.filter((r) => r.matchType !== 'invalid').length;
  const matchedExistingCount = parsedRows.filter((r) => r.matchType === 'existing').length;
  const newAccountCount = parsedRows.filter((r) => r.matchType === 'new_account').length;
  const errorCount = parsedRows.filter((r) => r.validationErrors.length > 0).length;

  return {
    fileName: config.fileName,
    fileSize: config.fileSize,
    uploadMode: config.uploadMode,
    targetClass: config.selectedClass,
    academicSession: config.academicSession,
    term: config.term,
    examName: config.examName,
    totalRows: parsedRows.length,
    validRows,
    matchedExistingCount,
    newAccountCount,
    errorCount,
    classesDetected: Array.from(classesDetectedSet),
    subjectsDetected: Array.from(subjectsDetectedSet),
    parsedRows,
  };
}
