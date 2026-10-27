import { StudentAccount, StudentResult } from '../types';

export const INITIAL_STUDENTS: StudentAccount[] = [
  {
    id: 'std-101',
    studentId: 'MOK-2026-0001',
    fullName: 'David Chukwuma Adeleke',
    normalizedName: 'adeleke chukwuma david',
    gender: 'Male',
    currentClass: 'Grade 10A',
    email: 'david.adeleke@students.mok.edu',
    parentEmail: 'adeleke.parent@gmail.com',
    accountStatus: 'active',
    createdAt: '2026-01-10T08:00:00Z',
    lastSyncedAt: '2026-03-15T10:00:00Z',
    resultsHistory: [
      {
        id: 'res-old-1',
        studentId: 'MOK-2026-0001',
        academicSession: '2025/2026',
        term: 'Term 3',
        examName: 'Promotional Examination',
        className: 'Grade 9A',
        scores: { Mathematics: 88, English: 79, Physics: 84, Chemistry: 82 },
        totalScore: 333,
        averageScore: 83.25,
        overallGrade: 'A1',
        classRank: 2,
        uploadedAt: '2026-07-20T12:00:00Z',
      },
    ],
  },
  {
    id: 'std-102',
    studentId: 'MOK-2026-0002',
    fullName: 'Amina Zainab Bello',
    normalizedName: 'amina bello zainab',
    gender: 'Female',
    currentClass: 'Grade 10A',
    email: 'amina.bello@students.mok.edu',
    parentEmail: 'bello.zainab.mom@gmail.com',
    accountStatus: 'active',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'std-103',
    studentId: 'MOK-2026-0003',
    fullName: 'Michael Ethan Johnson',
    normalizedName: 'ethan johnson michael',
    gender: 'Male',
    currentClass: 'Grade 10A',
    email: 'michael.johnson@students.mok.edu',
    parentEmail: 'ejohnson.work@outlook.com',
    accountStatus: 'active',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'std-104',
    studentId: 'MOK-2026-0004',
    fullName: 'Fatima Maryam Yusuf',
    normalizedName: 'fatima maryam yusuf',
    gender: 'Female',
    currentClass: 'Grade 10B',
    email: 'fatima.yusuf@students.mok.edu',
    parentEmail: 'yusuf.family@yahoo.com',
    accountStatus: 'active',
    createdAt: '2026-01-12T09:30:00Z',
  },
  {
    id: 'std-105',
    studentId: 'MOK-2026-0005',
    fullName: 'Oluwaseun Brian Peters',
    normalizedName: 'brian oluwaseun peters',
    gender: 'Male',
    currentClass: 'Grade 10B',
    email: 'brian.peters@students.mok.edu',
    accountStatus: 'active',
    createdAt: '2026-01-12T09:30:00Z',
  },
  {
    id: 'std-106',
    studentId: 'MOK-2026-0006',
    fullName: 'Grace Chidinma Okonkwo',
    normalizedName: 'chidinma grace okonkwo',
    gender: 'Female',
    currentClass: 'Grade 11 Science',
    email: 'grace.okonkwo@students.mok.edu',
    accountStatus: 'active',
    createdAt: '2026-01-15T11:00:00Z',
  },
];

export const AVAILABLE_CLASSES = [
  'Grade 10A',
  'Grade 10B',
  'Grade 11 Science',
  'Grade 11 Arts',
  'Grade 12 Senior',
];

export const SAMPLE_MULTI_CLASS_CSV = `Student ID,Full Name,Class,Gender,Mathematics,English Language,Physics,Chemistry,Biology,Economics
MOK-2026-0001,David Chukwuma Adeleke,Grade 10A,Male,92,84,88,91,85,78
MOK-2026-0002,Amina Zainab Bello,Grade 10A,Female,95,90,92,89,94,88
,Samuel Kalu Nwosu,Grade 10A,Male,74,68,71,65,70,62
,Blessing Ifeanyi Eze,Grade 10A,Female,81,85,79,83,86,80
MOK-2026-0004,Fatima Maryam Yusuf,Grade 10B,Female,88,91,82,85,89,90
MOK-2026-0005,Oluwaseun Brian Peters,Grade 10B,Male,70,75,68,72,66,74
,Tariro Nicole Moyo,Grade 10B,Female,83,87,76,80,82,84
,Kwame Kofi Mensah,Grade 10B,Male,65,72,64,60,67,70
MOK-2026-0006,Grace Chidinma Okonkwo,Grade 11 Science,Female,94,89,95,93,92,85
,Kelechi Emmanuel Obi,Grade 11 Science,Male,78,74,80,85,76,71
,Zainab Aisha Danjuma,Grade 11 Science,Female,90,92,88,86,91,89
,Marcus Anthony Vance,Grade 11 Science,Male,62,69,70,68,65,63`;

export const SAMPLE_SINGLE_CLASS_CSV = `Student ID,Student Name,Gender,Mathematics,English Language,Physics,Chemistry,Biology,Civic Education
MOK-2026-0001,Adeleke David Chukwuma,Male,89,86,91,87,84,90
MOK-2026-0002,Bello Amina Zainab,Female,96,93,94,90,95,92
MOK-2026-0003,Johnson Michael Ethan,Male,78,82,75,79,72,80
,Chioma Happiness Madu,Female,84,88,80,82,85,86
,Emmanuel Toluwani Bakare,Male,72,70,68,75,69,73
,Jessica Anita Mensah,Female,91,89,88,86,90,92`;

export const SAMPLE_MULTI_CLASS_JSON = JSON.stringify(
  {
    academicSession: '2026/2027',
    term: 'Term 1',
    examName: 'First Term Examination',
    classes: [
      {
        className: 'Grade 10A',
        students: [
          {
            studentId: 'MOK-2026-0001',
            fullName: 'David Chukwuma Adeleke',
            gender: 'Male',
            scores: { Mathematics: 92, English: 84, Physics: 88, Chemistry: 91, Biology: 85 },
          },
          {
            fullName: 'Ngozi Clara Okafor',
            gender: 'Female',
            scores: { Mathematics: 85, English: 89, Physics: 80, Chemistry: 84, Biology: 88 },
          },
        ],
      },
      {
        className: 'Grade 10B',
        students: [
          {
            studentId: 'MOK-2026-0004',
            fullName: 'Fatima Maryam Yusuf',
            gender: 'Female',
            scores: { Mathematics: 88, English: 91, Physics: 82, Chemistry: 85, Biology: 89 },
          },
          {
            fullName: 'Ibrahim Farouk Hassan',
            gender: 'Male',
            scores: { Mathematics: 79, English: 81, Physics: 75, Chemistry: 78, Biology: 77 },
          },
        ],
      },
    ],
  },
  null,
  2
);

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
