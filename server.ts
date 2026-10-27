import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and files for persistent online storage
const DATA_DIR = path.resolve(__dirname, 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Initial seed students if file does not exist
const SEED_STUDENTS = [
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

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STUDENTS_FILE)) {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(SEED_STUDENTS, null, 2), 'utf-8');
  }
  if (!fs.existsSync(RESULTS_FILE)) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

async function startServer() {
  ensureDataFiles();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // ================= ONLINE API ROUTES =================

  // 1. Get all students / scholars online
  app.get('/api/students', (req: Request, res: Response) => {
    const students = readJSON(STUDENTS_FILE, SEED_STUDENTS);
    res.json(students);
  });

  // 2. Create single scholar
  app.post('/api/students', (req: Request, res: Response) => {
    const newStudent = req.body;
    if (!newStudent.fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    const students = readJSON(STUDENTS_FILE, SEED_STUDENTS);
    students.push(newStudent);
    writeJSON(STUDENTS_FILE, students);
    res.status(201).json(newStudent);
  });

  // 3. Update scholar online
  app.put('/api/students/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    let students = readJSON<any[]>(STUDENTS_FILE, []);
    const index = students.findIndex((s) => s.id === id || s.studentId === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Scholar not found' });
    }

    students[index] = { ...students[index], ...updates };
    writeJSON(STUDENTS_FILE, students);
    res.json(students[index]);
  });

  // 4. DELETE scholar online - MUST LEAVE IMMEDIATELY AND PERMANENTLY
  app.delete('/api/students/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    let students = readJSON<any[]>(STUDENTS_FILE, []);
    const initialCount = students.length;

    // Find the student to get their studentId for results cleanup
    const target = students.find((s) => s.id === id || s.studentId === id);
    const targetStudentId = target ? target.studentId : id;

    // Remove scholar permanently from database
    students = students.filter((s) => s.id !== id && s.studentId !== id);

    if (students.length === initialCount) {
      // Scholar was not found, but return success so client state is synced
      return res.json({ success: true, message: 'Scholar already removed', deletedId: id });
    }

    // Persist removal to online database file
    writeJSON(STUDENTS_FILE, students);

    // Also remove any academic results linked to this scholar
    let results = readJSON<any[]>(RESULTS_FILE, []);
    results = results.filter((r) => r.studentId !== targetStudentId && r.studentId !== id);
    writeJSON(RESULTS_FILE, results);

    console.log(`[ONLINE DB] Scholar ${id} (${targetStudentId}) deleted permanently.`);
    res.json({ success: true, deletedId: id, remainingCount: students.length });
  });

  // 5. Batch sync students & results online
  app.post('/api/batch-sync', (req: Request, res: Response) => {
    const { newStudents, updatedStudents, newResults, auditLog } = req.body;

    let currentStudents = readJSON<any[]>(STUDENTS_FILE, []);
    let currentResults = readJSON<any[]>(RESULTS_FILE, []);
    let currentLogs = readJSON<any[]>(LOGS_FILE, []);

    // Add new students
    if (Array.isArray(newStudents) && newStudents.length > 0) {
      currentStudents.push(...newStudents);
    }

    // Update existing students
    if (Array.isArray(updatedStudents) && updatedStudents.length > 0) {
      updatedStudents.forEach((up: any) => {
        const idx = currentStudents.findIndex((s) => s.id === up.id || s.studentId === up.studentId);
        if (idx !== -1) {
          currentStudents[idx] = { ...currentStudents[idx], ...up };
        }
      });
    }

    // Merge results
    if (Array.isArray(newResults) && newResults.length > 0) {
      newResults.forEach((nr: any) => {
        const existingIdx = currentResults.findIndex(
          (r) =>
            r.studentId === nr.studentId &&
            r.academicSession === nr.academicSession &&
            r.term === nr.term &&
            r.examName === nr.examName
        );
        if (existingIdx !== -1) {
          currentResults[existingIdx] = nr;
        } else {
          currentResults.push(nr);
        }
      });
    }

    // Append log
    if (auditLog) {
      currentLogs.unshift(auditLog);
    }

    // Save all to online disk storage
    writeJSON(STUDENTS_FILE, currentStudents);
    writeJSON(RESULTS_FILE, currentResults);
    writeJSON(LOGS_FILE, currentLogs);

    res.json({
      success: true,
      totalStudents: currentStudents.length,
      totalResults: currentResults.length,
    });
  });

  // 6. Get all results online
  app.get('/api/results', (req: Request, res: Response) => {
    const results = readJSON(RESULTS_FILE, []);
    res.json(results);
  });

  // 7. Get audit logs online
  app.get('/api/logs', (req: Request, res: Response) => {
    const logs = readJSON(LOGS_FILE, []);
    res.json(logs);
  });

  // 8. Reset online database
  app.post('/api/reset', (req: Request, res: Response) => {
    writeJSON(STUDENTS_FILE, SEED_STUDENTS);
    writeJSON(RESULTS_FILE, []);
    writeJSON(LOGS_FILE, []);
    res.json({ success: true, message: 'Database reset to default seed records' });
  });

  // ================= VITE DEV / PROD MIDDLEWARE =================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mok Online Academic Backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
