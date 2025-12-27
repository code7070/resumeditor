import React, { useState, useRef } from "react";
import type { CVData } from "../../../types";
import { SparkleIcon } from "../../icons/SparkleIcon";
import { parseResumeFromPdf } from "../../../services/gemini";
import { Upload, SparklesIcon, Loader2 } from "lucide-react";
import { DialogApp } from "../../ui/DialogApp";

interface ImportActionProps {
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export function ImportAction({ setData }: ImportActionProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showImportConsent, setShowImportConsent] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importConsentAccepted, setImportConsentAccepted] = useState({
    data: false,
    ai: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <>
      <button
        onClick={() => setShowUploadDialog(true)}
        className="group flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
      >
        <div className="relative size-[14px] overflow-hidden">
          <Upload
            size={14}
            className="transition-all group-hover:-translate-y-full"
          />
          <SparklesIcon
            size={14}
            className="transition-all group-hover:-translate-y-full"
          />
        </div>
        <span className="hidden md:inline">Import</span>
      </button>

      {/* Upload Dialog */}
      <DialogApp
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
      </DialogApp>

      {/* Import Consent Dialog */}
      <DialogApp
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
      </DialogApp>
    </>
  );
}
