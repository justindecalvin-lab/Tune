import { StudentAccount, StudentResult, SyncAuditLog } from '../types';

export async function fetchStudentsOnline(): Promise<StudentAccount[]> {
  const res = await fetch('/api/students');
  if (!res.ok) {
    throw new Error(`Failed to fetch students: ${res.statusText}`);
  }
  return res.json();
}

export async function createStudentOnline(student: Partial<StudentAccount>): Promise<StudentAccount> {
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  if (!res.ok) {
    throw new Error(`Failed to create student: ${res.statusText}`);
  }
  return res.json();
}

export async function updateStudentOnline(
  id: string,
  updates: Partial<StudentAccount>
): Promise<StudentAccount> {
  const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update student: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteStudentOnline(id: string): Promise<{ success: boolean; deletedId: string }> {
  const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete scholar: ${res.statusText}`);
  }
  return res.json();
}

export async function batchSyncOnline(payload: {
  newStudents: StudentAccount[];
  updatedStudents: Partial<StudentAccount>[];
  newResults: StudentResult[];
  auditLog: SyncAuditLog;
}): Promise<{ success: boolean; totalStudents: number; totalResults: number }> {
  const res = await fetch('/api/batch-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to commit batch sync online: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchResultsOnline(): Promise<StudentResult[]> {
  const res = await fetch('/api/results');
  if (!res.ok) {
    throw new Error(`Failed to fetch results: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchLogsOnline(): Promise<SyncAuditLog[]> {
  const res = await fetch('/api/logs');
  if (!res.ok) {
    throw new Error(`Failed to fetch logs: ${res.statusText}`);
  }
  return res.json();
}

export async function resetDatabaseOnline(): Promise<{ success: boolean }> {
  const res = await fetch('/api/reset', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Failed to reset online database: ${res.statusText}`);
  }
  return res.json();
}
