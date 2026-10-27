export interface SubjectScore {
  subject: string;
  score: number;
  grade?: string;
  maxScore?: number;
}

export interface StudentResult {
  id: string; // unique result record id
  studentId: string;
  academicSession: string; // e.g. "2026/2027"
  term: string; // e.g. "Term 1" or "First Term"
  examName: string; // e.g. "End of Term Examination"
  className: string;
  scores: Record<string, number>; // subject name -> score (0-100)
  totalScore: number;
  averageScore: number;
  gpa?: number;
  overallGrade: string;
  classRank?: number;
  remarks?: string;
  uploadedAt: string;
}

export interface StudentAccount {
  id: string; // internal UUID
  studentId: string; // official school ID (e.g. MOK/2026/0142)
  fullName: string;
  normalizedName: string;
  gender?: 'Male' | 'Female' | 'Other';
  currentClass: string;
  email: string;
  parentEmail?: string;
  phone?: string;
  accountStatus: 'active' | 'newly_provisioned' | 'pending_activation';
  tempPassword?: string;
  createdAt: string;
  lastSyncedAt?: string;
  resultsHistory?: StudentResult[];
}

export type UploadMode = 'multi-class' | 'single-class';

export interface ParsedStudentRow {
  rowNumber: number;
  rawRecord: Record<string, any>;
  studentId?: string;
  fullName: string;
  gender?: string;
  className: string;
  email?: string;
  parentEmail?: string;
  subjects: Record<string, number>;
  totalScore?: number;
  averageScore?: number;
  remarks?: string;
  matchType: 'existing' | 'new_account' | 'conflict' | 'invalid';
  matchedStudent?: StudentAccount;
  validationErrors: string[];
  generatedStudentId?: string;
  generatedTempPassword?: string;
  generatedEmail?: string;
}

export interface BatchUploadSummary {
  fileName: string;
  fileSize: number;
  uploadMode: UploadMode;
  targetClass?: string;
  academicSession: string;
  term: string;
  examName: string;
  totalRows: number;
  validRows: number;
  matchedExistingCount: number;
  newAccountCount: number;
  errorCount: number;
  classesDetected: string[];
  subjectsDetected: string[];
  parsedRows: ParsedStudentRow[];
}

export interface SyncAuditLog {
  id: string;
  timestamp: string;
  fileName: string;
  session: string;
  term: string;
  totalSynced: number;
  accountsCreated: number;
  resultsUpdated: number;
  classesInvolved: string[];
  newStudentCredentials: Array<{
    name: string;
    studentId: string;
    class: string;
    email: string;
    tempPassword: string;
  }>;
}
