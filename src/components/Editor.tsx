import React, { useState } from "react";
import type { CVData } from "../types";
import { HeaderForm } from "./editor/HeaderForm";
import { ExperienceForm } from "./editor/ExperienceForm";
import { SectionsForm } from "./editor/SectionsForm";
import { SparkleIcon } from "./icons/SparkleIcon";
import { refineText } from "../services/gemini";
import { FileText, Loader2, ArrowRight } from "lucide-react";
import { Dialog } from "./ui/Dialog";
import { ConfirmDialog } from "./ui/ConfirmDialog";

interface EditorProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export function Editor({ data, setData }: EditorProps) {
  const [isRefining, setIsRefining] = useState(false);

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

  // Refine AI State
  const [showRefineConsent, setShowRefineConsent] = useState(false);
  const [refineConsentAccepted, setRefineConsentAccepted] = useState(false);
  const [showRefineResults, setShowRefineResults] = useState(false);
  const [showRefineSelection, setShowRefineSelection] = useState(false);
  const [refineOptions, setRefineOptions] = useState<string[]>([]);

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

  const handleRefineSummary = () => {
    if (!data.summary) return;
    setShowRefineConsent(true);
  };

  const handleConsentConfirmed = () => {
    setShowRefineConsent(false);
    setShowRefineSelection(true);
  };

  const executeRefine = async (type: "summary" | "full") => {
    setShowRefineSelection(false);
    setShowRefineResults(true);
    setIsRefining(true);
    setRefineOptions([]); // Clear previous options

    try {
      const options = await refineText(
        data.summary,
        type === "full" ? data : undefined
      );
      setRefineOptions(options);
    } catch (_e) {
      alert("Failed to refine text. Ensure VITE_GEMINI_API_KEY is set in .env");
      setShowRefineResults(false);
    } finally {
      setIsRefining(false);
    }
  };

  const applyRefineOption = (option: string) => {
    setData((prev) => ({ ...prev, summary: option }));
    setShowRefineResults(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 h-full p-6 space-y-8">
      {/* Refine Selection Dialog */}
      <Dialog
        isOpen={showRefineSelection}
        onClose={() => setShowRefineSelection(false)}
        title="Enhance Summary"
      >
        <div className="space-y-4 py-2">
          <button
            onClick={() => executeRefine("summary")}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group flex items-start gap-4"
          >
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <SparkleIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Quick Polish</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Refine sentence structure and tone based only on your current
                summary text. Best for quick grammar and style fixes.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 ml-auto mt-2" />
          </button>

          <button
            onClick={() => executeRefine("full")}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group flex items-start gap-4"
          >
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Deep Analysis</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Generate a new summary by analyzing your entire CV (experience,
                skills, header). Best for creating impactful, comprehensive
                introductions.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 ml-auto mt-2" />
          </button>
        </div>
      </Dialog>

      {/* Refine Consent Dialog */}
      <Dialog
        isOpen={showRefineConsent}
        onClose={() => setShowRefineConsent(false)}
        title="AI Refine Consent"
      >
        <div className="space-y-6 py-4">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm mb-4">
              <SparkleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              AI Content Refinement
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              We use Google Gemini AI to analyze your resume content and
              generate professional variations. Your data will be processed
              securely.
            </p>
          </div>

          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              checked={refineConsentAccepted}
              onChange={(e) => setRefineConsentAccepted(e.target.checked)}
            />
            <span className="text-xs text-gray-700 leading-tight">
              I consent to send my content (Summary or Full CV) to AI for
              refinement and understand Use of AI.
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={() => setShowRefineConsent(false)}
              className="flex-1 py-3 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!refineConsentAccepted}
              onClick={handleConsentConfirmed}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/10"
            >
              Start Refining
            </button>
          </div>
        </div>
      </Dialog>

      {/* Refine Results Dialog */}
      <Dialog
        isOpen={showRefineResults}
        onClose={() => !isRefining && setShowRefineResults(false)}
        title={isRefining ? "Refining Summary..." : "Choose a Version"}
      >
        {isRefining ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-50 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <SparkleIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-gray-900">
                Generating Improvements...
              </p>
              <p className="text-xs text-gray-500">
                Creating professional variations for you.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {refineOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => applyRefineOption(option)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors uppercase tracking-wider">
                    Option {idx + 1}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed dark:text-gray-300">
                  {option}
                </p>
              </button>
            ))}
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        onConfirm={deleteConfirm.onConfirm}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
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

      <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
        <p>
          Built with lazy from{" "}
          <a
            href="https://underline.id"
            className="text-orange-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Underline
          </a>
        </p>
      </div>
    </div>
  );
}
