import { useState } from "react";
import { Loader2 } from "lucide-react";
import { SparkleIcon } from "../icons/SparkleIcon";
import { AiConsentDialog } from "../ui/AiConsentDialog";
import { DialogApp } from "../ui/DialogApp";
import { refineText } from "../../services/gemini";
import { RichTextEditor } from "./RichTextEditor";
import type { CVData } from "../../types";

interface SummaryFormProps {
  data: string;
  onChange: (value: string) => void;
  fullData: CVData;
}

export function SummaryForm({
  data,
  onChange,
  fullData,
}: Readonly<SummaryFormProps>) {
  const [isRefining, setIsRefining] = useState(false);

  // Refine AI State
  const [showRefineConsent, setShowRefineConsent] = useState(false);
  const [showRefineResults, setShowRefineResults] = useState(false);
  const [showRefineSelection, setShowRefineSelection] = useState(false);
  const [refineOptions, setRefineOptions] = useState<string[]>([]);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [refineType, setRefineType] = useState<"summary" | "full" | null>(null);

  const handleRefineSummary = () => {
    // If empty, we can still generate from full CV
    if (!data && !fullData.experience.length) return;
    setShowRefineConsent(true);
  };

  const handleConsentConfirmed = () => {
    setShowRefineConsent(false);
    setShowRefineSelection(true);
    setRefineType(null);
    setAdditionalPrompt("");
  };

  const executeRefine = async () => {
    if (!refineType) return;
    setShowRefineSelection(false);
    setShowRefineResults(true);
    setIsRefining(true);
    setRefineOptions([]); // Clear previous options

    try {
      const options = await refineText(
        data,
        refineType === "full" ? fullData : undefined,
        additionalPrompt
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
    // If AI output is plain text, wrap it in a paragraph
    const htmlContent = option.startsWith("<p>") ? option : `<p>${option}</p>`;
    onChange(htmlContent);
    setShowRefineResults(false);
  };

  return (
    <div className="space-y-4">
      {/* <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Content
        </label>
        <button
          onClick={handleRefineSummary}
          disabled={isRefining}
          className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 text-[11px] hover:text-emerald-800 dark:hover:text-emerald-200 disabled:opacity-50 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-800"
        >
          {isRefining ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <SparkleIcon className="w-3 h-3" />
          )}
          Refine with AI
        </button>
      </div> */}

      <RichTextEditor
        value={data}
        onChange={onChange}
        placeholder="Write a compelling professional summary..."
        className="h-64"
      />

      <div className="flex justify-end">
        <button
          onClick={handleRefineSummary}
          disabled={isRefining}
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

      {/* Refine Selection Dialog */}
      <DialogApp
        isOpen={showRefineSelection}
        onClose={() => setShowRefineSelection(false)}
        title="Enhance Summary"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Choose how you want to refine your professional summary.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setRefineType("summary")}
              className={`flex-1 p-4 rounded-lg border text-left hover:border-emerald-500 transition-all ${
                refineType === "summary"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="font-semibold text-sm mb-1">
                Refine Summary Only
              </div>
              <div className="text-xs text-gray-500">
                Improves phrasing and impact of your current summary text.
              </div>
            </button>
            <button
              onClick={() => setRefineType("full")}
              className={`flex-1 p-4 rounded-lg border text-left hover:border-emerald-500 transition-all ${
                refineType === "full"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="font-semibold text-sm mb-1">Generate from CV</div>
              <div className="text-xs text-gray-500">
                Creates a new summary based on your experience and skills.
              </div>
            </button>
          </div>

          {refineType && (
            <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Additional Instructions (Optional)
              </label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="E.g., Focus on leadership, emphasize React skills, make it concise..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none min-h-[80px]"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={executeRefine}
              disabled={!refineType}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              Generate Ideas
            </button>
          </div>
        </div>
      </DialogApp>

      {/* Refine Consent Dialog */}
      <AiConsentDialog
        isOpen={showRefineConsent}
        onClose={() => setShowRefineConsent(false)}
        onConfirm={handleConsentConfirmed}
        title="AI Assistance Consent"
        description="For the purpose of refining your summary, the content of your CV
            will be sent to Google's Gemini AI. This data is only used for
            processing your request and is not stored permanently."
        confirmLabel="Start Refining"
        consentItems={[
          {
            id: "ai_refine",
            label:
              "I consent to send my content (Summary or Full CV) to AI for refinement and understand Use of AI.",
          },
        ]}
      />

      {/* Refine Results Dialog */}
      <DialogApp
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
      </DialogApp>
    </div>
  );
}
