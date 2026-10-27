/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StudentAccount,
  StudentResult,
  SyncAuditLog,
  BatchUploadSummary,
} from './types';
import {
  fetchStudentsOnline,
  fetchResultsOnline,
  fetchLogsOnline,
  deleteStudentOnline,
  updateStudentOnline,
  batchSyncOnline,
  resetDatabaseOnline,
} from './utils/api';
import { calculateGrade, normalizeName } from './utils/matching';
import { Header } from './components/Header';
import { UploadTab } from './components/UploadTab';
import { PreviewGrid } from './components/PreviewGrid';
import { SyncSuccessModal } from './components/SyncSuccessModal';
import { StudentsDirectory } from './components/StudentsDirectory';
import { ResultsBroadsheet } from './components/ResultsBroadsheet';
import { GuideTab } from './components/GuideTab';

export default function App() {
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [auditLogs, setAuditLogs] = useState<SyncAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'upload' | 'students' | 'broadsheet' | 'guide'>('students');
  const [pendingSummary, setPendingSummary] = useState<BatchUploadSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedLog, setCompletedLog] = useState<SyncAuditLog | null>(null);

  const [activeReportCard, setActiveReportCard] = useState<{
    student: StudentAccount;
    result: StudentResult;
  } | null>(null);

  // Load state online from server on startup
  const loadOnlineData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedStudents, fetchedResults, fetchedLogs] = await Promise.all([
        fetchStudentsOnline(),
        fetchResultsOnline(),
        fetchLogsOnline(),
      ]);
      setStudents(fetchedStudents);
      setResults(fetchedResults);
      setAuditLogs(fetchedLogs);
    } catch (err) {
      console.error('Failed to load online data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOnlineData();
  }, [loadOnlineData]);

  // DELETE Scholar immediately and permanently online
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    // 1. Immediate optimistic UI update - scholar leaves UI instantaneously!
    const targetStudent = students.find((s) => s.id === studentId || s.studentId === studentId);
    const targetOfficialId = targetStudent ? targetStudent.studentId : studentId;

    setStudents((prev) => prev.filter((s) => s.id !== studentId && s.studentId !== studentId));
    setResults((prev) => prev.filter((r) => r.studentId !== targetOfficialId && r.studentId !== studentId));

    try {
      // 2. Online backend deletion - persists permanently to server disk database
      await deleteStudentOnline(studentId);
    } catch (err: any) {
      console.error('Failed to delete scholar online:', err);
      // Revert if server call failed
      loadOnlineData();
      throw err;
    }
  };

  // UPDATE Scholar online
  const handleUpdateStudent = async (id: string, updates: Partial<StudentAccount>) => {
    // Optimistic update
    setStudents((prev) =>
      prev.map((s) => (s.id === id || s.studentId === id ? { ...s, ...updates } : s))
    );

    try {
      await updateStudentOnline(id, updates);
    } catch (err: any) {
      console.error('Failed to update scholar online:', err);
      loadOnlineData();
      throw err;
    }
  };

  // Commit batch sync online
  const handleCommitSync = async (summary: BatchUploadSummary) => {
    setIsProcessing(true);

    try {
      const newStudentsToCreate: StudentAccount[] = [];
      const updatedStudentsToSync: Partial<StudentAccount>[] = [];
      const newResults: StudentResult[] = [];
      const newCredentials: Array<{
        name: string;
        studentId: string;
        class: string;
        email: string;
        tempPassword: string;
      }> = [];
      const classesTouched = new Set<string>();

      summary.parsedRows.forEach((row) => {
        if (row.matchType === 'invalid') return;

        classesTouched.add(row.className);
        let studentTargetId = row.studentId;

        if (row.matchType === 'new_account') {
          const generatedId =
            row.generatedStudentId ||
            `MOK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const tempPass = row.generatedTempPassword || 'Mok@2026';
          const email =
            row.generatedEmail || `student.${generatedId.toLowerCase()}@students.mok.edu`;

          const newStudent: StudentAccount = {
            id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            studentId: generatedId,
            fullName: row.fullName,
            normalizedName: normalizeName(row.fullName),
            gender: (row.gender as any) || undefined,
            currentClass: row.className,
            email,
            parentEmail: row.parentEmail,
            accountStatus: 'newly_provisioned',
            tempPassword: tempPass,
            createdAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
          };

          newStudentsToCreate.push(newStudent);
          studentTargetId = generatedId;

          newCredentials.push({
            name: row.fullName,
            studentId: generatedId,
            class: row.className,
            email,
            tempPassword: tempPass,
          });
        } else if (row.matchedStudent) {
          updatedStudentsToSync.push({
            id: row.matchedStudent.id,
            studentId: row.matchedStudent.studentId,
            currentClass: row.className || row.matchedStudent.currentClass,
            lastSyncedAt: new Date().toISOString(),
          });
        }

        const gradeInfo = calculateGrade(row.averageScore || 0);
        const resultRecord: StudentResult = {
          id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          studentId: studentTargetId || '',
          academicSession: summary.academicSession,
          term: summary.term,
          examName: summary.examName,
          className: row.className,
          scores: row.subjects,
          totalScore: row.totalScore || 0,
          averageScore: row.averageScore || 0,
          gpa: gradeInfo.gpa,
          overallGrade: gradeInfo.grade,
          remarks: row.remarks || gradeInfo.remark,
          uploadedAt: new Date().toISOString(),
        };

        newResults.push(resultRecord);
      });

      const auditLog: SyncAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        fileName: summary.fileName,
        session: summary.academicSession,
        term: summary.term,
        totalSynced: newResults.length,
        accountsCreated: newCredentials.length,
        resultsUpdated: newResults.length - newCredentials.length,
        classesInvolved: Array.from(classesTouched),
        newStudentCredentials: newCredentials,
      };

      // Send to online backend server
      await batchSyncOnline({
        newStudents: newStudentsToCreate,
        updatedStudents: updatedStudentsToSync,
        newResults,
        auditLog,
      });

      // Reload fresh state online
      await loadOnlineData();

      setCompletedLog(auditLog);
      setPendingSummary(null);
    } catch (err: any) {
      console.error('Batch sync failed:', err);
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        'Reset online database? This will restore the official default scholars and wipe test results on the online server.'
      )
    ) {
      try {
        await resetDatabaseOnline();
        await loadOnlineData();
        setPendingSummary(null);
        setCompletedLog(null);
      } catch (err: any) {
        alert(`Reset failed: ${err.message}`);
      }
    }
  };

  const newlyProvisionedCount = students.filter(
    (s) => s.accountStatus === 'newly_provisioned'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalStudents={students.length}
        newlyProvisionedCount={newlyProvisionedCount}
        totalResults={results.length}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Upload & Ingestion Tab */}
        {activeTab === 'upload' && (
          <>
            {pendingSummary ? (
              <PreviewGrid
                summary={pendingSummary}
                onCommitSync={handleCommitSync}
                onCancel={() => setPendingSummary(null)}
                isProcessing={isProcessing}
              />
            ) : (
              <UploadTab
                existingStudents={students}
                onFileProcessed={(summary) => setPendingSummary(summary)}
                onOpenGuide={() => setActiveTab('guide')}
              />
            )}
          </>
        )}

        {/* Results Broadsheet Tab */}
        {activeTab === 'broadsheet' && (
          <ResultsBroadsheet
            students={students}
            results={results}
            activeReportCard={activeReportCard}
            setActiveReportCard={setActiveReportCard}
          />
        )}

        {/* Scholar Accounts & Admin Credential Vault Tab */}
        {activeTab === 'students' && (
          <StudentsDirectory
            students={students}
            results={results}
            onDeleteStudent={handleDeleteStudent}
            onUpdateStudent={handleUpdateStudent}
            onOpenReportCard={(student, result) => {
              setActiveReportCard({ student, result });
              setActiveTab('broadsheet');
            }}
            isLoading={isLoading}
          />
        )}

        {/* File Format Guide Tab */}
        {activeTab === 'guide' && <GuideTab />}
      </main>

      {/* Success Modal */}
      {completedLog && (
        <SyncSuccessModal
          log={completedLog}
          onClose={() => setCompletedLog(null)}
          onGoToBroadsheet={() => {
            setCompletedLog(null);
            setActiveTab('broadsheet');
          }}
          onGoToStudents={() => {
            setCompletedLog(null);
            setActiveTab('students');
          }}
        />
      )}
    </div>
  );
}
