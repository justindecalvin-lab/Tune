import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  Download,
  Key,
  Users,
  FileSpreadsheet,
  ArrowRight,
  X,
} from 'lucide-react';
import { SyncAuditLog } from '../types';
import { downloadFile } from '../utils/sampleData';

interface SyncSuccessModalProps {
  log: SyncAuditLog;
  onClose: () => void;
  onGoToBroadsheet: () => void;
  onGoToStudents: () => void;
}

export const SyncSuccessModal: React.FC<SyncSuccessModalProps> = ({
  log,
  onClose,
  onGoToBroadsheet,
  onGoToStudents,
}) => {
  const downloadCredentialsCSV = () => {
    let csv = 'Student ID,Full Name,Class,Email,Temporary Password\n';
    log.newStudentCredentials.forEach((c) => {
      csv += `"${c.studentId}","${c.name}","${c.class}","${c.email}","${c.tempPassword}"\n`;
    });
    downloadFile(
      csv,
      `mok_new_credentials_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv'
    );
  };

  const downloadCredentialsSlipsTXT = () => {
    let txt = `=======================================================\n`;
    txt += `          MOK HIGH SCHOOL - STUDENT ACCESS SLIPS       \n`;
    txt += `  Batch Sync Date: ${new Date(log.timestamp).toLocaleString()}  \n`;
    txt += `=======================================================\n\n`;

    log.newStudentCredentials.forEach((c, idx) => {
      txt += `-------------------------------------------------------\n`;
      txt += `STUDENT SLIP #${idx + 1}\n`;
      txt += `Name:          ${c.name}\n`;
      txt += `Student ID:    ${c.studentId}\n`;
      txt += `Class:         ${c.class}\n`;
      txt += `Portal Email:  ${c.email}\n`;
      txt += `Temp Password: ${c.tempPassword}\n`;
      txt += `Instructions:  Log in at https://portal.mok.edu/login\n`;
      txt += `               Change your password upon initial sign-in.\n`;
      txt += `-------------------------------------------------------\n\n`;
    });

    downloadFile(
      txt,
      `mok_student_login_slips_${new Date().toISOString().slice(0, 10)}.txt`,
      'text/plain'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Batch Execution Succeeded
            </div>
            <h2 className="text-2xl font-bold text-white">Results Synced Successfully!</h2>
            <p className="text-xs text-slate-400">
              {log.fileName} • {log.session} ({log.term})
            </p>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-extrabold text-white">{log.totalSynced}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Results Synced</div>
          </div>
          <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 text-center">
            <div className="text-2xl font-extrabold text-emerald-300">
              +{log.accountsCreated}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Accounts Created</div>
          </div>
          <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30 text-center">
            <div className="text-2xl font-extrabold text-indigo-300">
              {log.classesInvolved.length}
            </div>
            <div className="text-[11px] text-indigo-400 mt-0.5">Classes Updated</div>
          </div>
        </div>

        {/* Credentials Distribution Section */}
        {log.newStudentCredentials.length > 0 && (
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Newly Created Student Credentials ({log.newStudentCredentials.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadCredentialsCSV}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg"
                >
                  <Download className="w-3 h-3" />
                  CSV Roster
                </button>
                <button
                  onClick={downloadCredentialsSlipsTXT}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg"
                >
                  <Download className="w-3 h-3" />
                  Printable Slips
                </button>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto divide-y divide-slate-800/80 pr-1">
              {log.newStudentCredentials.map((c, i) => (
                <div key={i} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{c.name}</span>
                    <span className="text-slate-500 ml-2 font-mono">({c.class})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-indigo-300">{c.studentId}</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {c.tempPassword}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onGoToStudents();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>View All Student Accounts</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToBroadsheet();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Open Class Results Broadsheet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
