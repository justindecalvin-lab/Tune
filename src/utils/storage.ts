import { StudentAccount, StudentResult, SyncAuditLog } from '../types';
import { INITIAL_STUDENTS } from './sampleData';

const STUDENTS_STORAGE_KEY = 'mok_students_db_v1';
const RESULTS_STORAGE_KEY = 'mok_results_db_v1';
const LOGS_STORAGE_KEY = 'mok_sync_logs_v1';

export function getStoredStudents(): StudentAccount[] {
  try {
    const data = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load students from storage:', err);
  }
  return INITIAL_STUDENTS;
}

export function saveStoredStudents(students: StudentAccount[]): void {
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students to storage:', err);
  }
}

export function getStoredResults(): StudentResult[] {
  try {
    const data = localStorage.getItem(RESULTS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load results from storage:', err);
  }
  return [];
}

export function saveStoredResults(results: StudentResult[]): void {
  try {
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
  } catch (err) {
    console.error('Failed to save results to storage:', err);
  }
}

export function getStoredLogs(): SyncAuditLog[] {
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load logs from storage:', err);
  }
  return [];
}

export function saveStoredLogs(logs: SyncAuditLog[]): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save logs to storage:', err);
  }
}

export function resetDatabaseToDefault(): void {
  localStorage.removeItem(STUDENTS_STORAGE_KEY);
  localStorage.removeItem(RESULTS_STORAGE_KEY);
  localStorage.removeItem(LOGS_STORAGE_KEY);
}
