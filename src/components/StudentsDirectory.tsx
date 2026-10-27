import React, { useState } from 'react';
import {
  StudentAccount,
  StudentResult,
} from '../types';
import {
  Users,
  Search,
  Filter,
  Key,
  Mail,
  Calendar,
  Sparkles,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  GraduationCap,
  FileText,
  X,
  Trash2,
  Edit2,
  Save,
  AlertTriangle,
  CloudCheck,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import { downloadFile } from '../utils/sampleData';

interface StudentsDirectoryProps {
  students: StudentAccount[];
  results: StudentResult[];
  onDeleteStudent: (studentId: string, studentName: string) => Promise<void>;
  onUpdateStudent: (id: string, updates: Partial<StudentAccount>) => Promise<void>;
  onOpenReportCard: (student: StudentAccount, result: StudentResult) => void;
  isLoading?: boolean;
}

export const StudentsDirectory: React.FC<StudentsDirectoryProps> = ({
  students,
  results,
  onDeleteStudent,
  onUpdateStudent,
  onOpenReportCard,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected student for Profile modal
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<StudentAccount | null>(null);

  // Edit state inside drawer
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Partial<StudentAccount>>({});
  const [isSavingOnline, setIsSavingOnline] = useState<boolean>(false);

  // Delete confirmation modal state
  const [studentToDelete, setStudentToDelete] = useState<StudentAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Unique classes
  const classes = Array.from(new Set(students.map((s) => s.currentClass))).filter(Boolean).sort();

  const togglePassword = (studentId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStudents = students.filter((s) => {
    if (classFilter !== 'ALL' && s.currentClass !== classFilter) return false;
    if (statusFilter !== 'ALL' && s.accountStatus !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchId = s.studentId.toLowerCase().includes(q);
      const matchEmail = (s.email || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail) return false;
    }
    return true;
  });

  const exportRosterCSV = () => {
    let csv = 'Student ID,Full Name,Class,Gender,Email,Status,Temporary Password\n';
    filteredStudents.forEach((s) => {
      csv += `"${s.studentId}","${s.fullName}","${s.currentClass}","${s.gender || ''}","${s.email}","${s.accountStatus}","${s.tempPassword || ''}"\n`;
    });
    downloadFile(csv, 'mok_admin_credential_vault.csv', 'text/csv');
  };

  const getStudentResults = (studentId: string): StudentResult[] => {
    return results.filter((r) => r.studentId === studentId);
  };

  // Handle immediate permanent deletion
  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    const targetName = studentToDelete.fullName;
    const targetId = studentToDelete.id || studentToDelete.studentId;

    try {
      await onDeleteStudent(targetId, targetName);
      setStudentToDelete(null);
      if (selectedStudentForProfile && selectedStudentForProfile.id === targetId) {
        setSelectedStudentForProfile(null);
      }
      showToast(`Scholar "${targetName}" removed permanently from online database.`);
    } catch (err: any) {
      alert(`Failed to delete scholar: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle saving student modifications online
  const handleSaveStudentModifications = async () => {
    if (!selectedStudentForProfile) return;
    setIsSavingOnline(true);
    try {
      await onUpdateStudent(selectedStudentForProfile.id, editFormData);
      setSelectedStudentForProfile({
        ...selectedStudentForProfile,
        ...editFormData,
      });
      setIsEditing(false);
      showToast('Scholar updated successfully in online database!');
    } catch (err: any) {
      alert(`Failed to save scholar online: ${err.message}`);
    } finally {
      setIsSavingOnline(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900/90 text-white border border-emerald-500/50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
              <Key className="w-3.5 h-3.5" />
              Admin Credential Vault
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online Database Active
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">Scholar Accounts & Credentials</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage scholar credentials, passwords, and records. Any scholar deleted leaves immediately and permanently from the online server.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportRosterCSV}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Vault CSV</span>
          </button>
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
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">All Classes ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-900">
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">All Accounts</option>
              <option value="active" className="bg-slate-900">Active</option>
              <option value="newly_provisioned" className="bg-slate-900">Newly Auto-Provisioned</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scholar name, ID or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Scholar Name</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Portal Email</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Vault Password</th>
                <th className="py-3 px-3 text-center">Results</th>
                <th className="py-3 px-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No scholars found in online database.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const stResults = getStudentResults(st.studentId);
                  const isNewlyProvisioned = st.accountStatus === 'newly_provisioned';

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isNewlyProvisioned ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-3 font-mono font-medium text-indigo-300 whitespace-nowrap">
                        {st.studentId}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedStudentForProfile(st);
                            setEditFormData(st);
                            setIsEditing(false);
                          }}
                          className="hover:underline text-left"
                        >
                          {st.fullName}
                        </button>
                        {st.gender && (
                          <span className="text-[10px] text-slate-500 font-normal ml-1.5">
                            ({st.gender})
                          </span>
                        )}
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {st.currentClass}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{st.email}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isNewlyProvisioned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <Sparkles className="w-2.5 h-2.5" />
                            Auto-Provisioned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Password */}
                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        {st.tempPassword ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {visiblePasswords[st.studentId]
                                ? st.tempPassword
                                : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePassword(st.studentId)}
                              className="text-slate-400 hover:text-white p-1 rounded"
                              title="Toggle password"
                            >
                              {visiblePasswords[st.studentId] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                copyToClipboard(st.tempPassword!, `pass-${st.studentId}`)
                              }
                              className="text-slate-400 hover:text-white p-1 rounded"
                              title="Copy password"
                            >
                              {copiedId === `pass-${st.studentId}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            Password configured
                          </span>
                        )}
                      </td>

                      {/* Results count */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold">
                          {stResults.length} term(s)
                        </span>
                      </td>

                      {/* Action: Profile & Immediate Delete */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudentForProfile(st);
                              setEditFormData(st);
                              setIsEditing(false);
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => setStudentToDelete(st)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1"
                            title="Delete Scholar Immediately"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Delete Scholar Permanently?
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{studentToDelete.fullName}</strong> (
              <span className="font-mono text-indigo-400">{studentToDelete.studentId}</span>)?
            </p>
            <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300">
              ⚠️ This will remove the scholar account, login credentials, and all recorded results permanently from the online server. It will not return on reload.
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Deleting Online...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Scholar Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scholar Profile & Online Edit Modal */}
      {selectedStudentForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudentForProfile(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedStudentForProfile.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedStudentForProfile.studentId} • {selectedStudentForProfile.currentClass}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setEditFormData(selectedStudentForProfile);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Online</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveStudentModifications}
                    disabled={isSavingOnline}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingOnline ? 'Saving...' : 'Save Online'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Credentials Card */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Authentication & Online Details
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                  Cloud Synced
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Full Scholar Name:</label>
                    <input
                      type="text"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Class:</label>
                      <input
                        type="text"
                        value={editFormData.currentClass || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, currentClass: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Gender:</label>
                      <select
                        value={editFormData.gender || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Portal Email:</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Vault Password:</label>
                    <input
                      type="text"
                      value={editFormData.tempPassword || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, tempPassword: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-emerald-400 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">School Email:</span>
                    <span className="text-white font-mono">{selectedStudentForProfile.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Status:</span>
                    <span className="text-emerald-400 font-semibold capitalize">
                      {selectedStudentForProfile.accountStatus.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedStudentForProfile.tempPassword && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Vault Password:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {selectedStudentForProfile.tempPassword}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Academic Results History */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Academic Results History
              </h4>
              {getStudentResults(selectedStudentForProfile.studentId).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                  No uploaded term results for this scholar yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {getStudentResults(selectedStudentForProfile.studentId).map((res) => (
                    <div
                      key={res.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-white text-xs">
                            {res.academicSession} - {res.term}
                          </span>
                          <span className="text-slate-400 text-[11px] block">{res.examName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-indigo-400 font-bold text-sm">
                            {res.averageScore.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Grade: {res.overallGrade}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedStudentForProfile(null);
                            onOpenReportCard(selectedStudentForProfile, res);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Full Report Card
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danger Zone: Delete Scholar permanently */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Permanently delete this scholar from the online vault.
              </span>
              <button
                onClick={() => setStudentToDelete(selectedStudentForProfile)}
                className="text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Scholar Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
