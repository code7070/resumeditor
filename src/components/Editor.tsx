import React, { useState, useEffect } from "react";
import type { CVData } from "../types";
import { HeaderForm } from "./editor/HeaderForm";
import { ExperienceForm } from "./editor/ExperienceForm";
import { SectionsForm } from "./editor/SectionsForm";
import { SparkleIcon } from "./icons/SparkleIcon";
import { generateMarkdown, generateLatex } from "../utils/exporters";
import {
  refineText,
  parseResumeFromPdf,
  analyzeATSScore,
  type ATSAnalysisResult,
} from "../services/gemini";
import {
  Upload,
  FileText,
  FileCode,
  Check,
  Loader2,
  Download,
  Share2,
  FileJson,
  ShieldCheck,
  ArrowRight,
  ListRestart,
  Printer,
} from "lucide-react";
import { Dialog } from "./ui/Dialog";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { ATSAnalysisArt } from "./ATSAnalysisArt";

interface ATSHistoryItem {
  id: string;
  timestamp: number;
  result: ATSAnalysisResult;
}

interface EditorProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export function Editor({ data, setData }: EditorProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showATSDialog, setShowATSDialog] = useState(false);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [atsHistory, setAtsHistory] = useState<ATSHistoryItem[]>([]);
  const [atsConsentAccepted, setAtsConsentAccepted] = useState({
    data: false,
    ai: false,
  });
  const [importConsentAccepted, setImportConsentAccepted] = useState({
    data: false,
    ai: false,
  });
  const [viewingHistoryItem, setViewingHistoryItem] =
    useState<ATSHistoryItem | null>(null);
  const [showConsentGate, setShowConsentGate] = useState(true);
  const [showImportConsent, setShowImportConsent] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showRescanConfirm, setShowRescanConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [copyStatus, setCopyStatus] = useState<"idle" | "md" | "tex" | "json">(
    "idle"
  );

  useEffect(() => {
    const saved = localStorage.getItem("ats_history");
    if (saved) {
      try {
        setAtsHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    // Load saved ATS result
    const savedResult = localStorage.getItem("ats_current_result");
    if (savedResult) {
      try {
        setAtsResult(JSON.parse(savedResult));
      } catch (e) {
        console.error("Failed to load ATS result", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ats_history", JSON.stringify(atsHistory));
  }, [atsHistory]);

  // Save current ATS result to localStorage
  useEffect(() => {
    if (atsResult) {
      localStorage.setItem("ats_current_result", JSON.stringify(atsResult));
    }
  }, [atsResult]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const confirmDelete = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const handleRefineSummary = async () => {
    if (!data.summary) return;
    setIsRefining(true);
    try {
      const refined = await refineText(data.summary);
      setData((prev) => ({ ...prev, summary: refined }));
    } catch (_e) {
      alert("Failed to refine text. Ensure VITE_GEMINI_API_KEY is set in .env");
    } finally {
      setIsRefining(false);
    }
  };

  const handleAnalyzeATS = async () => {
    setIsAnalyzingATS(true);
    setShowATSDialog(true);
    setAtsResult(null);
    setViewingHistoryItem(null);
    setShowConsentGate(false);
    try {
      const result = await analyzeATSScore(data);
      setAtsResult(result);
      const newItem: ATSHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        result,
      };
      setAtsHistory((prev) => [newItem, ...prev].slice(0, 50));
    } catch (e) {
      console.error(e);
      alert("Failed to analyze ATS. Please try again.");
      setShowATSDialog(false);
    } finally {
      setIsAnalyzingATS(false);
    }
  };

  const openATSDialog = () => {
    setShowATSDialog(true);
    // Show consent gate only if no result exists and no history
    if (!atsResult && atsHistory.length === 0) {
      setShowConsentGate(true);
    } else {
      setShowConsentGate(false);
    }
  };

  const handleExport = (type: "md" | "tex" | "json") => {
    if (type === "json") {
      const content = JSON.stringify(data, null, 2);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${(data.header.name || "cv")
        .replace(/\s+/g, "-")
        .toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const content =
      type === "md" ? generateMarkdown(data) : generateLatex(data);
    navigator.clipboard.writeText(content);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // JSON files don't need AI consent
    if (file.type === "application/json") {
      handleFileUpload(file);
    } else {
      // For PDF/other files that need AI parsing, show consent
      setPendingFile(file);
      setShowImportConsent(true);
    }
    e.target.value = "";
  };

  const handleFileUpload = async (file: File) => {
    setIsImporting(true);
    setShowImportConsent(false);

    try {
      if (file.type === "application/json") {
        const text = await file.text();
        const json = JSON.parse(text);
        setData((prev) => ({ ...prev, ...json }));
        setIsImporting(false);
        setShowUploadDialog(false);
        return;
      }

      // For PDF and other files, use AI parsing
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        try {
          const parsedData = await parseResumeFromPdf(base64Data, file.type);
          if (parsedData) {
            setData((prev) => ({ ...prev, ...parsedData }));
            setShowUploadDialog(false);
          }
        } catch (err) {
          console.error(err);
          alert("Failed to parse file with AI.");
        } finally {
          setIsImporting(false);
          setPendingFile(null);
        }
      };
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
      setIsImporting(false);
      setPendingFile(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 h-full p-6 space-y-8">
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowUploadDialog(true)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
        >
          <Upload size={14} /> Import
        </button>
        <button
          onClick={() => setShowExportDialog(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium border border-gray-200 dark:border-gray-700"
        >
          <Share2 size={14} /> Export
        </button>
        <button
          onClick={openATSDialog}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-semibold border border-blue-200 dark:border-blue-800"
        >
          <ShieldCheck size={14} /> Scanner ATS
        </button>
      </div>

      {/* Upload Dialog */}
      <Dialog
        isOpen={showUploadDialog}
        onClose={() => !isImporting && setShowUploadDialog(false)}
        title="Import Resume"
      >
        <div className="space-y-6">
          <div // nosonar
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (!isImporting) fileInputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isImporting
                ? "border-emerald-200 bg-emerald-50"
                : "border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/10 cursor-pointer"
            }`}
            onClick={() => !isImporting && fileInputRef.current?.click()}
          >
            {isImporting ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-emerald-900">
                    Analyzing your resume...
                  </p>
                  <p className="text-xs text-emerald-700">
                    This might take a few seconds
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white rounded-full shadow-sm mb-2 text-emerald-700 ring-1 ring-gray-100">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Click to upload a file
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF, JSON, MD, TXT
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.md,.txt,.json"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isImporting}
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-md flex gap-3 border border-blue-100">
            <div className="text-blue-600 mt-0.5">
              <SparkleIcon className="w-4 h-4" />
            </div>
            <div className="text-xs text-blue-800 leading-relaxed">
              <span className="font-semibold block mb-1">
                AI Extract Feature
              </span>
              Upload your existing PDF resume and we'll use Gemini AI to
              intelligently extract and format your information automatically.
            </div>
          </div>
        </div>
      </Dialog>

      {/* Import Consent Dialog */}
      <Dialog
        isOpen={showImportConsent}
        onClose={() => {
          setShowImportConsent(false);
          setPendingFile(null);
          setImportConsentAccepted({ data: false, ai: false });
        }}
        title="AI Import Consent"
      >
        <div className="space-y-6 py-4">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm mb-4">
              <Upload size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              AI Processing Consent
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              To extract information from your resume, we use Google Gemini AI
              to intelligently parse and structure your data. Your file is
              processed securely and not stored permanently.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                checked={importConsentAccepted.data}
                onChange={(e) =>
                  setImportConsentAccepted((prev) => ({
                    ...prev,
                    data: e.target.checked,
                  }))
                }
              />
              <span className="text-xs text-gray-700 leading-tight">
                I consent to upload my resume file for AI processing.
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                checked={importConsentAccepted.ai}
                onChange={(e) =>
                  setImportConsentAccepted((prev) => ({
                    ...prev,
                    ai: e.target.checked,
                  }))
                }
              />
              <span className="text-xs text-gray-700 leading-tight">
                I understand that AI will extract information from my resume.
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowImportConsent(false);
                setPendingFile(null);
                setImportConsentAccepted({ data: false, ai: false });
              }}
              className="flex-1 py-3 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={
                !importConsentAccepted.ai || !importConsentAccepted.data
              }
              onClick={() => {
                if (pendingFile) {
                  handleFileUpload(pendingFile);
                  setImportConsentAccepted({ data: false, ai: false });
                }
              }}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/10"
            >
              Proceed with Import
            </button>
          </div>
        </div>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        title="Export Resume"
      >
        <div className="space-y-2">
          <button
            onClick={() => {
              window.print();
              setShowExportDialog(false);
            }}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-lg transition-colors group text-left border border-emerald-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-md shadow-sm text-emerald-700 ring-1 ring-emerald-200">
                <Printer size={20} />
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-900">
                  Export as PDF
                </span>
                <span className="block text-xs text-gray-600">
                  Print or save your resume as PDF
                </span>
              </div>
            </div>
            <Download
              size={16}
              className="text-emerald-600 group-hover:text-emerald-700 transition-colors"
            />
          </button>

          <button
            onClick={() => handleExport("json")}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group text-left border border-transparent hover:border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-md shadow-sm text-amber-700 ring-1 ring-gray-100">
                <FileJson size={20} />
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-900">
                  Download JSON
                </span>
                <span className="block text-xs text-gray-500">
                  Save a backup of your data
                </span>
              </div>
            </div>
            <Download
              size={16}
              className="text-gray-400 group-hover:text-amber-700 transition-colors"
            />
          </button>

          <button
            onClick={() => handleExport("md")}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group text-left border border-transparent hover:border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-md shadow-sm text-blue-700 ring-1 ring-gray-100">
                <FileText size={20} />
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-900">
                  Copy Metadata
                </span>
                <span className="block text-xs text-gray-500">
                  Copy as Markdown format
                </span>
              </div>
            </div>
            {copyStatus === "md" ? (
              <Check size={16} className="text-emerald-600" />
            ) : (
              <Download
                size={16}
                className="text-gray-400 group-hover:text-blue-700 transition-colors"
              />
            )}
          </button>

          <button
            onClick={() => handleExport("tex")}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group text-left border border-transparent hover:border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-md shadow-sm text-emerald-700 ring-1 ring-gray-100">
                <FileCode size={20} />
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-900">
                  Copy LaTeX
                </span>
                <span className="block text-xs text-gray-500">
                  Copy as LaTeX format
                </span>
              </div>
            </div>
            {copyStatus === "tex" ? (
              <Check size={16} className="text-emerald-600" />
            ) : (
              <Download
                size={16}
                className="text-gray-400 group-hover:text-emerald-700 transition-colors"
              />
            )}
          </button>
        </div>
      </Dialog>

      {/* ATS Result Dialog */}
      <Dialog
        isOpen={showATSDialog}
        onClose={() => !isAnalyzingATS && setShowATSDialog(false)}
        title="ATS Analysis Report"
      >
        <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar -mx-2 px-2">
          {showConsentGate ? (
            <div className="space-y-6 py-4">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  AI Processing Consent
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  To provide high-quality ATS scoring, we use Google Gemini AI
                  to analyze your resume content. Your data is processed
                  securely and not stored permanently on our servers.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    checked={atsConsentAccepted.data}
                    onChange={(e) =>
                      setAtsConsentAccepted((prev) => ({
                        ...prev,
                        data: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-xs text-gray-700 leading-tight">
                    I am okay to send my information (Contact, Experience,
                    Skills) for processing.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    checked={atsConsentAccepted.ai}
                    onChange={(e) =>
                      setAtsConsentAccepted((prev) => ({
                        ...prev,
                        ai: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-xs text-gray-700 leading-tight">
                    I understand that an AI will evaluate my resume against
                    industry standards.
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowATSDialog(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!atsConsentAccepted.ai || !atsConsentAccepted.data}
                  onClick={handleAnalyzeATS}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
                >
                  Start Scanning
                </button>
              </div>
            </div>
          ) : isAnalyzingATS ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-base font-bold text-gray-900">
                  Measuring Data Resonance...
                </p>
                <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                  AI is currently evaluating your CV structure and keyword
                  density.
                </p>
              </div>
            </div>
          ) : viewingHistoryItem ? (
            <div className="flex flex-col h-full">
              <ATSAnalysisArt
                result={viewingHistoryItem.result}
                timestamp={viewingHistoryItem.timestamp}
                onBack={() => setViewingHistoryItem(null)}
              />
            </div>
          ) : atsResult ? (
            <div className="flex flex-col h-full pb-6">
              <ATSAnalysisArt
                result={atsResult}
                timestamp={Date.now()}
                onBack={
                  atsHistory.length > 1
                    ? () => setViewingHistoryItem(null)
                    : undefined
                }
              />
              <div className="px-6 mt-4">
                <button
                  onClick={() => setShowRescanConfirm(true)}
                  className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 border border-gray-200"
                >
                  <ListRestart size={14} /> Re-Scan ATS Resonance
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Recent Scans
                </h3>
                <button
                  onClick={() => setShowConsentGate(true)}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  New Scan
                </button>
              </div>
              {atsHistory.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-xs italic">No scan history found.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {atsHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setViewingHistoryItem(item)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-transparent hover:border-gray-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${
                            item.result.score >= 80
                              ? "bg-emerald-50 text-emerald-700"
                              : item.result.score >= 50
                              ? "bg-blue-50 text-blue-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {Math.round(item.result.score)}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900">
                            ATS Assessment
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-gray-400 group-hover:text-gray-900 transition-colors"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        onConfirm={deleteConfirm.onConfirm}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
      />

      <ConfirmDialog
        isOpen={showRescanConfirm}
        title="Re-Scan Optimization"
        message="A new scan will perform a fresh analysis of your current CV data. This will not delete your past history, but it will replace the current active report view."
        confirmLabel="Start New Scan"
        isDestructive={false}
        onConfirm={() => {
          setShowRescanConfirm(false);
          // Clear current result and history on re-scan
          setAtsResult(null);
          setAtsHistory([]);
          localStorage.removeItem("ats_current_result");
          localStorage.removeItem("ats_history");
          handleAnalyzeATS();
        }}
        onClose={() => setShowRescanConfirm(false)}
      />

      <div className="space-y-1 mb-4">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
          Font Style
        </div>
        <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
          {(["serif", "sans", "mono"] as const).map((font) => (
            <button
              key={font}
              onClick={() => setData((prev) => ({ ...prev, font }))}
              className={`px-3 py-1.5 text-xs rounded-md capitalize transition-all ${
                data.font === font
                  ? "bg-white dark:bg-gray-700 shadow-sm text-emerald-900 dark:text-emerald-300 font-semibold ring-1 ring-black/5 dark:ring-white/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {font === "serif"
                ? "Serif (Classic)"
                : font === "sans"
                ? "Sans (Modern)"
                : "Mono (Tech)"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            Header Details
          </h3>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800">
          <HeaderForm
            data={data.header}
            onChange={(h) => setData((prev) => ({ ...prev, header: h }))}
            confirmDelete={confirmDelete}
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            Professional Summary
          </h3>
          <button
            onClick={handleRefineSummary}
            disabled={isRefining || !data.summary}
            className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 text-[11px] hover:text-emerald-800 dark:hover:text-emerald-200 disabled:opacity-50 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-800"
          >
            {isRefining ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <SparkleIcon className="w-3 h-3" />
            )}
            Refine with AI
          </button>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800">
          <textarea
            value={data.summary}
            onChange={(e) =>
              setData((prev) => ({ ...prev, summary: e.target.value }))
            }
            className="w-full h-32 p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none transition-all text-sm leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Write a compelling professional summary..."
          />
        </div>
      </div>

      <ExperienceForm
        data={data.experience}
        onChange={(exp) => setData((prev) => ({ ...prev, experience: exp }))}
        confirmDelete={confirmDelete}
      />

      <SectionsForm
        data={data.customSections}
        onChange={(sections) =>
          setData((prev) => ({ ...prev, customSections: sections }))
        }
        confirmDelete={confirmDelete}
      />

      <div className="pt-8 text-center text-xs text-gray-400 dark:text-gray-500">
        <p>Built with React & Tailwind V4</p>
      </div>
    </div>
  );
}
