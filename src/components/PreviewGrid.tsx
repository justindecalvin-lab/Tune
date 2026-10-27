import React, { useState } from 'react';
import {
  BatchUploadSummary,
  ParsedStudentRow,
  StudentAccount,
} from '../types';
import {
  CheckCircle,
  AlertTriangle,
  UserCheck,
  UserPlus,
  ArrowRight,
  RotateCcw,
  Search,
  Filter,
  Eye,
  Key,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { calculateGrade } from '../utils/matching';

interface PreviewGridProps {
  summary: BatchUploadSummary;
  onCommitSync: (summary: BatchUploadSummary) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export const PreviewGrid: React.FC<PreviewGridProps> = ({
  summary,
  onCommitSync,
  onCancel,
  isProcessing,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [matchTypeFilter, setMatchTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showPasswordDetails, setShowPasswordDetails] = useState<boolean>(true);

  // Filter rows
  const filteredRows = summary.parsedRows.filter((row) => {
    if (selectedClassFilter !== 'ALL' && row.className !== selectedClassFilter) {
      return false;
    }
    if (matchTypeFilter === 'EXISTING' && row.matchType !== 'existing') {
      return false;
    }
    if (matchTypeFilter === 'NEW' && row.matchType !== 'new_account') {
      return false;
    }
    if (matchTypeFilter === 'ERRORS' && row.validationErrors.length === 0) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = row.fullName.toLowerCase().includes(q);
      const matchId = (row.studentId || row.generatedStudentId || '').toLowerCase().includes(q);
      const matchClass = row.className.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchClass) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                Parsed Successfully
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {summary.fileName} ({Math.round(summary.fileSize / 1024)} KB)
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              Validation & Account Sync Preview
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Session: <strong className="text-slate-200">{summary.academicSession}</strong> • Term:{' '}
              <strong className="text-slate-200">{summary.term}</strong> • Exam:{' '}
              <strong className="text-slate-200">{summary.examName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel & Pick Another File
            </button>
            <button
              onClick={() => onCommitSync(summary)}
              disabled={isProcessing || summary.validRows === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Syncing to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Commit & Sync ({summary.validRows} Records)
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Rows</span>
              <span className="text-xs text-indigo-400 font-mono">100% Parsed</span>
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {summary.totalRows}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Across {summary.classesDetected.length} class(es)
            </p>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-300 font-medium">Existing Students</span>
              <UserCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-300 mt-2">
              {summary.matchedExistingCount}
            </div>
            <p className="text-[11px] text-indigo-400/80 mt-1">
              Results will sync to existing account
            </p>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-medium">New Accounts to Create</span>
              <UserPlus className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-2">
              {summary.newAccountCount}
            </div>
            <p className="text-[11px] text-emerald-400/80 mt-1">
              Auto-generate IDs, emails & logins
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Subjects Detected</span>
              <GraduationCap className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {summary.subjectsDetected.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate" title={summary.subjectsDetected.join(', ')}>
              {summary.subjectsDetected.slice(0, 3).join(', ')}
              {summary.subjectsDetected.length > 3 ? ` +${summary.subjectsDetected.length - 3} more` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Class Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">
                All Classes ({summary.classesDetected.length})
              </option>
              {summary.classesDetected.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-900">
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Action:</span>
            <select
              value={matchTypeFilter}
              onChange={(e) => setMatchTypeFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">All Rows</option>
              <option value="EXISTING" className="bg-slate-900">Existing Accounts ({summary.matchedExistingCount})</option>
              <option value="NEW" className="bg-slate-900">New Accounts ({summary.newAccountCount})</option>
              {summary.errorCount > 0 && (
                <option value="ERRORS" className="bg-slate-900">With Warnings ({summary.errorCount})</option>
              )}
            </select>
          </div>

          {/* Toggle credentials preview */}
          <button
            onClick={() => setShowPasswordDetails(!showPasswordDetails)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showPasswordDetails
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Key className="w-3 h-3" />
            <span>{showPasswordDetails ? 'Hide Generated Passwords' : 'Show Generated Passwords'}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tabulated Results Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">Sync Action</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Class</th>
                {showPasswordDetails && <th className="py-3 px-3">Generated Credentials</th>}
                {summary.subjectsDetected.map((subj) => (
                  <th key={subj} className="py-3 px-2 text-center min-w-[70px]">
                    {subj}
                  </th>
                ))}
                <th className="py-3 px-3 text-center">Total</th>
                <th className="py-3 px-3 text-center">Average</th>
                <th className="py-3 px-3 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8 + summary.subjectsDetected.length}
                    className="py-12 text-center text-slate-500"
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const gradeInfo = calculateGrade(row.averageScore || 0);
                  const isNew = row.matchType === 'new_account';

                  return (
                    <tr
                      key={row.rowNumber}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isNew ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-slate-500 font-mono">
                        {row.rowNumber}
                      </td>

                      {/* Sync Action Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isNew ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                            <UserPlus className="w-3 h-3" />
                            <span>Auto-Create Account</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-semibold">
                            <UserCheck className="w-3 h-3" />
                            <span>Sync to Existing</span>
                          </div>
                        )}
                        {row.validationErrors.length > 0 && (
                          <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>{row.validationErrors[0]}</span>
                          </div>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        {row.fullName}
                        {row.gender && (
                          <span className="text-[10px] text-slate-500 font-normal ml-1.5">
                            ({row.gender})
                          </span>
                        )}
                      </td>

                      {/* Student ID */}
                      <td className="py-3 px-3 font-mono text-xs whitespace-nowrap">
                        {isNew ? (
                          <span className="text-emerald-400 font-medium">
                            {row.generatedStudentId}
                            <span className="text-[9px] bg-emerald-500/20 px-1 py-0.2 rounded ml-1">NEW</span>
                          </span>
                        ) : (
                          <span className="text-slate-300">
                            {row.studentId || row.matchedStudent?.studentId}
                          </span>
                        )}
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                          {row.className}
                        </span>
                      </td>

                      {/* Generated Credentials for new accounts */}
                      {showPasswordDetails && (
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isNew ? (
                            <div className="space-y-0.5 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-400 font-mono">
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{row.generatedEmail}</span>
                              </div>
                              <div className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
                                <Key className="w-3 h-3 text-emerald-500" />
                                <span>Temp Pass: {row.generatedTempPassword}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">
                              Existing student login active
                            </span>
                          )}
                        </td>
                      )}

                      {/* Subject Scores */}
                      {summary.subjectsDetected.map((subj) => {
                        const score = row.subjects[subj];
                        return (
                          <td key={subj} className="py-3 px-2 text-center font-mono">
                            {score !== undefined ? (
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                  score >= 70
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : score >= 50
                                    ? 'text-indigo-300 bg-indigo-500/10'
                                    : score >= 40
                                    ? 'text-amber-400 bg-amber-500/10'
                                    : 'text-rose-400 bg-rose-500/10'
                                }`}
                              >
                                {score}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total */}
                      <td className="py-3 px-3 text-center font-bold text-white font-mono">
                        {row.totalScore}
                      </td>

                      {/* Average */}
                      <td className="py-3 px-3 text-center font-bold text-indigo-400 font-mono">
                        {row.averageScore?.toFixed(1)}%
                      </td>

                      {/* Overall Grade */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            gradeInfo.grade.startsWith('A')
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : gradeInfo.grade.startsWith('B')
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : gradeInfo.grade.startsWith('C')
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : gradeInfo.grade.startsWith('D') || gradeInfo.grade.startsWith('E')
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {gradeInfo.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{filteredRows.length}</strong> of{' '}
            <strong className="text-white">{summary.totalRows}</strong> records parsed.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Accounts and results are verified and ready for synchronization</span>
          </div>
        </div>
      </div>
    </div>
  );
};
