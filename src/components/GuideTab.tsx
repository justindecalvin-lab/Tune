import React, { useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileCode,
  Table,
} from 'lucide-react';
import {
  SAMPLE_MULTI_CLASS_CSV,
  SAMPLE_SINGLE_CLASS_CSV,
  SAMPLE_MULTI_CLASS_JSON,
  downloadFile,
} from '../utils/sampleData';

export const GuideTab: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      {/* Question 1: Is this possible? */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Direct Answer
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Yes, this is 100% possible and standard practice.
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              In school portals and Student Information Systems (SIS like Mok), batch uploading tabulated results with automatic account provisioning is the industry standard.
              The system reads the spreadsheet, matches rows to existing students, syncs their academic scores, and dynamically generates new student profiles and login credentials for unregistered students.
            </p>
          </div>
        </div>

        {/* How the Auto-Sync & Provisioning Workflow Works */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="font-semibold text-white text-sm">Flexible Ingestion</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Upload a single class file, a consolidated multi-class file, a multi-sheet Excel workbook, or JSON. The engine auto-detects subjects and classes.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="font-semibold text-white text-sm">Dual Matching Engine</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              First checks official Student ID / Admission Number. If absent, applies normalized fuzzy name matching (handling title prefixes and name order).
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="font-semibold text-white text-sm">Auto-Provisioning & Slips</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Unmatched students automatically receive an official Student ID (e.g., <code className="text-emerald-300">MOK-2026-0108</code>), temporary password, and school email.
            </p>
          </div>
        </div>
      </div>

      {/* Question 2: How should I arrange the files to upload? */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            File Arrangement Options
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            How to Arrange Your Upload Files
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Choose either approach depending on how your teachers or exam officers compile results:
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Method 1: Multi-Class Consolidated File */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                  Method 1 (Recommended)
                </span>
                <span className="text-xs text-slate-400">CSV, XLSX, or JSON</span>
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Class in One File</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Include a dedicated <strong className="text-slate-200">Class</strong> (or <strong className="text-slate-200">Grade</strong>) column on each row. The system groups them automatically and creates/syncs students into their designated classes in a single upload.
              </p>

              <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                <div className="text-slate-500 mb-1">// Header row structure:</div>
                <div className="text-indigo-300 font-semibold">
                  Student ID, Full Name, Class, Gender, Math, English, Physics, Biology...
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => downloadFile(SAMPLE_MULTI_CLASS_CSV, 'mok_multi_class_template.csv', 'text/csv')}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Download Multi-Class CSV
              </button>
              <button
                onClick={() => handleCopy(SAMPLE_MULTI_CLASS_CSV, 'multi-csv')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium"
              >
                {copiedKey === 'multi-csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Sample
              </button>
            </div>
          </div>

          {/* Method 2: Class-by-Class Files */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Method 2
                </span>
                <span className="text-xs text-slate-400">Class-by-Class</span>
              </div>
              <h3 className="text-lg font-bold text-white">Separate File Per Class</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Each file represents a specific class (e.g. <code className="text-slate-300">Grade10A_Exam.csv</code>). You can either select the class in the dropdown UI before upload or let the filename set the class.
              </p>

              <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                <div className="text-slate-500 mb-1">// Header row structure:</div>
                <div className="text-emerald-300 font-semibold">
                  Student ID, Full Name, Gender, Math, English, Physics, Chemistry...
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => downloadFile(SAMPLE_SINGLE_CLASS_CSV, 'mok_single_class_template.csv', 'text/csv')}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Download Single-Class CSV
              </button>
              <button
                onClick={() => handleCopy(SAMPLE_SINGLE_CLASS_CSV, 'single-csv')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium"
              >
                {copiedKey === 'single-csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Sample
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Column Specification Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Table className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Recommended Column Schema</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            The parser is designed to be forgiving: column names are case-insensitive and recognize aliases (e.g., "Full Name", "Student Name", "Name" or "Admission No", "Student ID", "Reg No").
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Column Header</th>
                  <th className="py-3 px-3">Required?</th>
                  <th className="py-3 px-3">Aliases Accepted</th>
                  <th className="py-3 px-3">Behavior & Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Full Name</td>
                  <td className="py-3 px-3">
                    <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      REQUIRED
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    Student Name, Name, Candidate Name, or First Name + Last Name
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    Used to match existing student accounts or provision new student records.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Class</td>
                  <td className="py-3 px-3">
                    <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      CONDITIONAL
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    Grade, Classroom, Arm, Form
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    Required for multi-class uploads. Can be omitted if selecting target class in single-class upload mode.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Student ID</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      OPTIONAL
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    Admission No, Adm No, Reg No, Matric No, ID
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    If present, provides 100% exact matching. If blank or new, system automatically generates an official ID (e.g. <code className="text-emerald-400">MOK-2026-XXXX</code>).
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Subject Scores (e.g. Math, English)</td>
                  <td className="py-3 px-3">
                    <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      REQUIRED
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    Any subject name: Mathematics, Physics, Chemistry, Biology, Economics, etc.
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    Numeric scores (0 to 100). The parser dynamically detects any numeric columns not reserved for student info as academic subjects!
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Gender</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      OPTIONAL
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">Sex, M/F</td>
                  <td className="py-3 px-3 text-slate-400">
                    Male, Female, M, F. Added to student profile.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Parent / Student Email</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      OPTIONAL
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">Parent Email, Email</td>
                  <td className="py-3 px-3 text-slate-400">
                    For notifications and report card delivery. If empty, default student email is auto-generated.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON Schema Format */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">JSON Format Option</h3>
            </div>
            <button
              onClick={() => handleCopy(SAMPLE_MULTI_CLASS_JSON, 'json-schema')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              {copiedKey === 'json-schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copy JSON
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            If integrating with an API or automated script, you can post or upload JSON formatted as an array of students or grouped by class:
          </p>
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-60 leading-relaxed">
            {SAMPLE_MULTI_CLASS_JSON}
          </pre>
        </div>
      </div>
    </div>
  );
};
