import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Layers,
  Settings,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  StudentAccount,
  UploadMode,
  BatchUploadSummary,
} from '../types';
import {
  AVAILABLE_CLASSES,
  SAMPLE_MULTI_CLASS_CSV,
  SAMPLE_SINGLE_CLASS_CSV,
  SAMPLE_MULTI_CLASS_JSON,
  downloadFile,
} from '../utils/sampleData';
import {
  parseCSVToObjects,
  parseExcelBuffer,
  parseJSONData,
  processUploadedData,
} from '../utils/parser';

interface UploadTabProps {
  existingStudents: StudentAccount[];
  onFileProcessed: (summary: BatchUploadSummary) => void;
  onOpenGuide: () => void;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  existingStudents,
  onFileProcessed,
  onOpenGuide,
}) => {
  const [uploadMode, setUploadMode] = useState<UploadMode>('multi-class');
  const [selectedClass, setSelectedClass] = useState<string>('Grade 10A');
  const [academicSession, setAcademicSession] = useState<string>('2026/2027');
  const [term, setTerm] = useState<string>('Term 1');
  const [examName, setExamName] = useState<string>('First Term Examination');
  const [autoProvision, setAutoProvision] = useState<boolean>(true);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsParsing(true);
    setErrorMessage(null);

    try {
      let rawRecords: Record<string, any>[] = [];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'csv' || extension === 'tsv' || extension === 'txt') {
        const text = await file.text();
        rawRecords = parseCSVToObjects(text);
      } else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer();
        rawRecords = parseExcelBuffer(buffer);
      } else if (extension === 'json') {
        const text = await file.text();
        rawRecords = parseJSONData(text);
      } else {
        throw new Error(
          `Unsupported file format (.${extension}). Please upload a .csv, .xlsx, .xls, or .json file.`
        );
      }

      if (rawRecords.length === 0) {
        throw new Error(
          'No records found in the uploaded file. Please ensure the file has a header row and data rows.'
        );
      }

      const summary = processUploadedData(rawRecords, existingStudents, {
        fileName: file.name,
        fileSize: file.size,
        uploadMode,
        selectedClass: uploadMode === 'single-class' ? selectedClass : undefined,
        academicSession,
        term,
        examName,
        autoProvisionAccounts: autoProvision,
      });

      onFileProcessed(summary);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred while parsing the file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleTestSample = (type: 'multi' | 'single' | 'json') => {
    setIsParsing(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        let rawRecords: Record<string, any>[] = [];
        let fileName = '';

        if (type === 'multi') {
          rawRecords = parseCSVToObjects(SAMPLE_MULTI_CLASS_CSV);
          fileName = 'mok_multi_class_results_sample.csv';
          setUploadMode('multi-class');
        } else if (type === 'single') {
          rawRecords = parseCSVToObjects(SAMPLE_SINGLE_CLASS_CSV);
          fileName = 'mok_grade10a_results_sample.csv';
          setUploadMode('single-class');
          setSelectedClass('Grade 10A');
        } else {
          rawRecords = parseJSONData(SAMPLE_MULTI_CLASS_JSON);
          fileName = 'mok_results_batch.json';
          setUploadMode('multi-class');
        }

        const summary = processUploadedData(rawRecords, existingStudents, {
          fileName,
          fileSize: 4096,
          uploadMode: type === 'single' ? 'single-class' : 'multi-class',
          selectedClass: type === 'single' ? 'Grade 10A' : undefined,
          academicSession,
          term,
          examName,
          autoProvisionAccounts: autoProvision,
        });

        onFileProcessed(summary);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to parse sample data.');
      } finally {
        setIsParsing(false);
      }
    }, 250);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Automated Batch Ingestion
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Upload Student Results
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Upload tabulated academic scores in CSV, Excel, or JSON. The engine matches existing students, calculates broadsheet rankings, and automatically provisions new student accounts with IDs and credentials for unregistered students.
            </p>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>View File Format Specs</span>
          </button>
        </div>
      </div>

      {/* Upload Configuration Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
          <Settings className="w-4 h-4 text-indigo-400" />
          <span>Upload Configuration</span>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Upload Workflow Mode:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUploadMode('multi-class')}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                uploadMode === 'multi-class'
                  ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Layers className={`w-5 h-5 shrink-0 mt-0.5 ${uploadMode === 'multi-class' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-sm text-white">
                  Multi-Class Batch Upload
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Single file containing multiple classes with an explicit <code className="text-indigo-300 font-mono">Class</code> column or multi-sheet Excel.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('single-class')}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                uploadMode === 'single-class'
                  ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <FileSpreadsheet className={`w-5 h-5 shrink-0 mt-0.5 ${uploadMode === 'single-class' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-sm text-white">
                  Single Class Upload (Class-by-Class)
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Upload file for one designated class at a time (e.g. Grade 10A, SS2 Science).
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Academic Meta Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {uploadMode === 'single-class' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Class:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {AVAILABLE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Academic Session:
            </label>
            <input
              type="text"
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Term / Semester:
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Term 1">Term 1 (First Term)</option>
              <option value="Term 2">Term 2 (Second Term)</option>
              <option value="Term 3">Term 3 (Third Term)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Exam Name:
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Auto-provision accounts checkbox */}
        <div className="pt-2">
          <label className="flex items-center space-x-3 cursor-pointer bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={autoProvision}
              onChange={(e) => setAutoProvision(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>Automatically Provision Accounts for Unmatched Students</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Enabled
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Generates unique student ID (<code className="text-indigo-300">MOK-2026-XXXX</code>), temporary password, and school email so new students can immediately log in to check their results.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-900'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept=".csv,.xlsx,.xls,.json,.tsv,.txt"
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-lg font-bold text-white">
          Drop your tabulated results file here, or{' '}
          <span className="text-indigo-400 underline decoration-indigo-400/40">browse files</span>
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
          Supports <span className="text-slate-200 font-semibold">CSV</span>,{' '}
          <span className="text-slate-200 font-semibold">Excel (.xlsx/.xls)</span>,{' '}
          <span className="text-slate-200 font-semibold">JSON</span>, or{' '}
          <span className="text-slate-200 font-semibold">TSV</span>.
        </p>

        {isParsing && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-indigo-400 text-xs font-semibold">
            <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
            <span>Parsing file and analyzing student identities...</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 flex items-start gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-white">Parsing Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Quick Test Samples & Templates Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick One-Click Test Samples
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Test immediately without uploading your own file:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTestSample('multi')}
              disabled={isParsing}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              Test Multi-Class CSV (12 Students)
            </button>
            <button
              onClick={() => handleTestSample('single')}
              disabled={isParsing}
              className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              Test Single Class CSV (Grade 10A)
            </button>
            <button
              onClick={() => handleTestSample('json')}
              disabled={isParsing}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Test JSON Batch
            </button>
          </div>
        </div>

        {/* Downloadable Templates Row */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">Download Ready-to-Use File Templates:</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => downloadFile(SAMPLE_MULTI_CLASS_CSV, 'mok_template_multiclass.csv', 'text/csv')}
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Multi-Class CSV Template
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => downloadFile(SAMPLE_SINGLE_CLASS_CSV, 'mok_template_singleclass.csv', 'text/csv')}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Single-Class CSV Template
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => downloadFile(SAMPLE_MULTI_CLASS_JSON, 'mok_template.json', 'application/json')}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              JSON Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
