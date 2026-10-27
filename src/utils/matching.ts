import { StudentAccount } from '../types';

export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\b(master|miss|mister|mr|mrs)\b/gi, '')
    .trim()
    .split(/\s+/)
    .sort() // sorting tokens allows "John Doe" and "Doe John" to match consistently
    .join(' ');
}

export function generateStudentId(nextNumber: number): string {
  const currentYear = new Date().getFullYear();
  return `MOK-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
}

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Mok@${rand}`;
}

export function generateEmail(fullName: string, studentId: string): string {
  const cleaned = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/);
  if (cleaned.length >= 2) {
    return `${cleaned[0]}.${cleaned[cleaned.length - 1]}@students.mok.edu`;
  } else if (cleaned.length === 1 && cleaned[0]) {
    const idSlug = studentId.replace(/[^a-z0-9]/gi, '').toLowerCase();
    return `${cleaned[0]}.${idSlug.slice(-4)}@students.mok.edu`;
  }
  return `student.${studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@students.mok.edu`;
}

export function findMatchingStudent(
  search: {
    studentId?: string;
    fullName: string;
    className?: string;
  },
  existingStudents: StudentAccount[]
): StudentAccount | undefined {
  // Strategy 1: Check by direct student ID (Admission No)
  if (search.studentId) {
    const cleanSearchId = search.studentId.trim().toUpperCase().replace(/[\s\-_]/g, '');
    const foundById = existingStudents.find((s) => {
      const sId = s.studentId.trim().toUpperCase().replace(/[\s\-_]/g, '');
      return sId === cleanSearchId;
    });
    if (foundById) return foundById;
  }

  // Strategy 2: Check by Normalized Name + Same Class
  const normalizedInputName = normalizeName(search.fullName);
  if (!normalizedInputName) return undefined;

  if (search.className) {
    const targetClassClean = search.className.trim().toLowerCase();
    const foundInClass = existingStudents.find((s) => {
      const matchName = normalizeName(s.fullName) === normalizedInputName;
      const matchClass = s.currentClass.trim().toLowerCase() === targetClassClean;
      return matchName && matchClass;
    });
    if (foundInClass) return foundInClass;
  }

  // Strategy 3: Check by Normalized Name alone if unique in database
  const matchingStudents = existingStudents.filter(
    (s) => normalizeName(s.fullName) === normalizedInputName
  );
  if (matchingStudents.length === 1) {
    return matchingStudents[0];
  }

  return undefined;
}

export function calculateGrade(score: number): { grade: string; remark: string; gpa: number } {
  if (score >= 80) return { grade: 'A1', remark: 'Excellent', gpa: 4.0 };
  if (score >= 70) return { grade: 'B2', remark: 'Very Good', gpa: 3.5 };
  if (score >= 65) return { grade: 'B3', remark: 'Good', gpa: 3.0 };
  if (score >= 60) return { grade: 'C4', remark: 'Credit', gpa: 2.75 };
  if (score >= 55) return { grade: 'C5', remark: 'Credit', gpa: 2.5 };
  if (score >= 50) return { grade: 'C6', remark: 'Credit', gpa: 2.0 };
  if (score >= 45) return { grade: 'D7', remark: 'Pass', gpa: 1.5 };
  if (score >= 40) return { grade: 'E8', remark: 'Pass', gpa: 1.0 };
  return { grade: 'F9', remark: 'Fail', gpa: 0.0 };
}
