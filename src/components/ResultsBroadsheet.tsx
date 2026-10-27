import React, { useState } from 'react';
import {
  StudentAccount,
  StudentResult,
} from '../types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Trophy,
  Award,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  FileText,
  X,
} from 'lucide-react';
import { calculateGrade } from '../utils/matching';
import { downloadFile } from '../utils/sampleData';

interface ResultsBroadsheetProps {
  students: StudentAccount[];
  results: StudentResult[];
  activeReportCard: { student: StudentAccount; result: StudentResult } | null;
  setActiveReportCard: (val: { student: StudentAccount; result: StudentResult } | null) => void;
}

export const ResultsBroadsheet: React.FC<ResultsBroadsheetProps> = ({
  students,
  results,
  activeReportCard,
  setActiveReportCard,
}) => {
  // Extract unique classes present in results or students
  const availableClasses = Array.from(
    new Set([...results.map((r) => r.className), ...students.map((s) => s.currentClass)])
  ).filter(Boolean).sort();

  const [selectedClass, setSelectedClass] = useState<string>(
    availableClasses[0] || 'Grade 10A'
  );

  // Filter results for selected class
  const classResults = results.filter((r) => r.className === selectedClass);

  // Rank students by total score descending
  const rankedResults = [...classResults].sort((a, b) => b.totalScore - a.totalScore);

  // Extract all subjects present in this class results
  const subjectSet = new Set<string>();
  classResults.forEach((r) => {
    Object.keys(r.scores).forEach((subj) => subjectSet.add(subj));
  });
  const subjects = Array.from(subjectSet).sort();

  // Class stats
  const totalStudents = classResults.length;
  const classAverage =
    totalStudents > 0
      ? Math.round(
          (classResults.reduce((acc, r) => acc + r.averageScore, 0) / totalStudents) * 10
        ) / 10
      : 0;
  const topScore =
    totalStudents > 0 ? Math.max(...classResults.map((r) => r.averageScore)) : 0;

  const exportBroadsheetCSV = () => {
    let header = 'Position,Student ID,Student Name,' + subjects.join(',') + ',Total Score,Average,Grade\n';
    let rows = '';
    rankedResults.forEach((r, idx) => {
      const student = students.find((s) => s.studentId === r.studentId);
      const studentName = student?.fullName || r.studentId;
      const subjScores = subjects.map((s) => r.scores[s] ?? '').join(',');
      rows += `"${idx + 1}","${r.studentId}","${studentName}",${subjScores},${r.totalScore},${r.averageScore},"${r.overallGrade}"\n`;
    });
    downloadFile(header + rows, `mok_broadsheet_${selectedClass.replace(/\s+/g, '_')}.csv`, 'text/csv');
  };

  const getRankBadge = (pos: number) => {
    if (pos === 1)
      return (
        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
          <Trophy className="w-3 h-3 text-amber-400" />
          1st
        </span>
      );
    if (pos === 2)
      return (
        <span className="inline-flex items-center gap-1 bg-slate-300/20 text-slate-200 border border-slate-400/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
          <Award className="w-3 h-3 text-slate-300" />
          2nd
        </span>
      );
    if (pos === 3)
      return (
        <span className="inline-flex items-center gap-1 bg-amber-700/20 text-amber-500 border border-amber-700/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
          <Award className="w-3 h-3 text-amber-600" />
          3rd
        </span>
      );
    return <span className="text-slate-400 font-mono">{pos}th</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Class Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Class Performance Broadsheet
          </div>
          <h2 className="text-2xl font-bold text-white">Class Tabulated Results</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View compiled term results, positions, subject breakdowns, and generate student report cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Select Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-900">
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportBroadsheetCSV}
            disabled={classResults.length === 0}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Broadsheet (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      {totalStudents > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Students Ranked</span>
            <div className="text-2xl font-extrabold text-white mt-1">{totalStudents}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">In {selectedClass}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Class Average</span>
            <div className="text-2xl font-extrabold text-indigo-300 mt-1">{classAverage}%</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Mean overall score</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Top Student Score</span>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">{topScore}%</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Class highest average</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Subjects Assessed</span>
            <div className="text-2xl font-extrabold text-white mt-1">{subjects.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Curriculum subjects</p>
          </div>
        </div>
      )}

      {/* Broadsheet Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 text-center w-16">Rank</th>
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Student Name</th>
                {subjects.map((subj) => (
                  <th key={subj} className="py-3 px-2 text-center min-w-[70px]">
                    {subj}
                  </th>
                ))}
                <th className="py-3 px-3 text-center">Total</th>
                <th className="py-3 px-3 text-center">Average</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {rankedResults.length === 0 ? (
                <tr>
                  <td
                    colSpan={6 + subjects.length}
                    className="py-12 text-center text-slate-500"
                  >
                    No synced results for <strong className="text-slate-300">{selectedClass}</strong> yet.
                    Upload a results file or test with sample data.
                  </td>
                </tr>
              ) : (
                rankedResults.map((res, index) => {
                  const student = students.find((s) => s.studentId === res.studentId);
                  const studentName = student?.fullName || 'Unknown Student';
                  const position = index + 1;

                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-center">
                        {getRankBadge(position)}
                      </td>
                      <td className="py-3 px-3 font-mono text-indigo-300 whitespace-nowrap">
                        {res.studentId}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        {studentName}
                      </td>
                      {subjects.map((subj) => {
                        const score = res.scores[subj];
                        return (
                          <td key={subj} className="py-3 px-2 text-center font-mono">
                            {score !== undefined ? (
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                  score >= 70
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : score >= 50
                                    ? 'text-indigo-300 bg-indigo-500/10'
                                    : 'text-amber-400 bg-amber-500/10'
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
                      <td className="py-3 px-3 text-center font-bold text-white font-mono">
                        {res.totalScore}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-indigo-400 font-mono">
                        {res.averageScore.toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {res.overallGrade}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            if (student) {
                              setActiveReportCard({ student, result: res });
                            }
                          }}
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Card</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report Card Modal */}
      {activeReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveReportCard(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* School Header */}
            <div className="border-b-2 border-indigo-600 pb-4 mb-6 text-center">
              <div className="inline-flex items-center gap-2 mb-1">
                <GraduationCap className="w-7 h-7 text-indigo-600" />
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  MOK HIGH SCHOOL
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Official Term Academic Performance Report Card
              </p>
              <p className="text-xs text-indigo-700 font-bold mt-1">
                Academic Session: {activeReportCard.result.academicSession} • {activeReportCard.result.term}
              </p>
            </div>

            {/* Student Details Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
              <div>
                <span className="text-slate-500 block font-medium">Student Name:</span>
                <span className="font-bold text-slate-900">
                  {activeReportCard.student.fullName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Student ID:</span>
                <span className="font-mono font-bold text-indigo-600">
                  {activeReportCard.student.studentId}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Class:</span>
                <span className="font-bold text-slate-900">
                  {activeReportCard.result.className}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Exam:</span>
                <span className="font-bold text-slate-900">
                  {activeReportCard.result.examName}
                </span>
              </div>
            </div>

            {/* Scores Table */}
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden mb-6">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 border-b">Subject</th>
                  <th className="py-2.5 px-3 border-b text-center">Score (100)</th>
                  <th className="py-2.5 px-3 border-b text-center">Grade</th>
                  <th className="py-2.5 px-3 border-b">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.entries(activeReportCard.result.scores).map(([sub, score]) => {
                  const g = calculateGrade(score);
                  return (
                    <tr key={sub} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{sub}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{score}</td>
                      <td className="py-2 px-3 text-center font-bold text-indigo-600">
                        {g.grade}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{g.remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary Highlights */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between text-xs mb-6">
              <div>
                <span className="text-indigo-900 font-medium block">Cumulative Summary:</span>
                <span className="text-slate-600">
                  Total: <strong className="text-indigo-700">{activeReportCard.result.totalScore}</strong> |{' '}
                  Average: <strong className="text-indigo-700">{activeReportCard.result.averageScore.toFixed(1)}%</strong>
                </span>
              </div>
              <div className="text-right">
                <span className="text-indigo-900 font-medium block">Final Standing:</span>
                <span className="text-base font-extrabold text-indigo-700">
                  Grade {activeReportCard.result.overallGrade}
                </span>
              </div>
            </div>

            {/* Principal Signature & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="text-[11px] text-slate-500">
                Generated via Mok Results Portal • Verified Digital Document
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
