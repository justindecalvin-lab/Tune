import React from 'react';
import {
  GraduationCap,
  UploadCloud,
  Users,
  FileSpreadsheet,
  BookOpen,
  RotateCcw,
  Sparkles,
  Key,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'upload' | 'students' | 'broadsheet' | 'guide';
  setActiveTab: (tab: 'upload' | 'students' | 'broadsheet' | 'guide') => void;
  totalStudents: number;
  newlyProvisionedCount: number;
  totalResults: number;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalStudents,
  newlyProvisionedCount,
  totalResults,
  onResetData,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('upload')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Mok Results Sync
                </span>
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Batch Sync v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated Results Ingestion & Account Auto-Provisioning
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center space-x-4 bg-slate-800/80 border border-slate-700/60 rounded-full px-4 py-1.5 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Students:</span>
              <strong className="text-white">{totalStudents}</strong>
            </div>
            {newlyProvisionedCount > 0 && (
              <div className="flex items-center space-x-1.5 border-l border-slate-700 pl-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Auto-Created:</span>
                <strong className="text-amber-400 font-mono">+{newlyProvisionedCount}</strong>
              </div>
            )}
            <div className="flex items-center space-x-1.5 border-l border-slate-700 pl-3">
              <span className="text-slate-400">Synced Results:</span>
              <strong className="text-indigo-400">{totalResults}</strong>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onResetData}
              title="Reset Demo Data"
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Batch Upload & Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('broadsheet')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'broadsheet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Class Results Broadsheet</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>Admin Credential Vault</span>
            {newlyProvisionedCount > 0 && (
              <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {newlyProvisionedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>File Formatting Guide & Schema</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded border border-indigo-400/30">
              Answer & Specs
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
