import { useState } from "react";
import { Loader2 } from "lucide-react";
import { SparkleIcon } from "../icons/SparkleIcon";
import { AiConsentDialog } from "../ui/AiConsentDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
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
      <RichTextEditor
        value={data}
        onChange={onChange}
        placeholder="Write a compelling professional summary..."
        className="h-64"
      />

      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Write 2-4 sentences highlighting your key qualifications.
        </p>
        <button
          onClick={handleRefineSummary}
          disabled={isRefining}
          className="text-accent-coral flex items-center gap-1.5 text-[11px] hover:text-accent-coral/80 disabled:opacity-50 font-semibold bg-accent-coral-light px-2.5 py-1.5 rounded-md hover:bg-accent-coral-light/80 transition-colors border border-accent-coral/20"
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
      <Dialog
        open={showRefineSelection}
        onOpenChange={(open) => !open && setShowRefineSelection(false)}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Enhance Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6 pt-0">
            <p className="text-sm text-muted-foreground">
              Choose how you want to refine your professional summary.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setRefineType("summary")}
                className={`flex-1 p-4 rounded-lg border text-left hover:border-accent-coral transition-all ${
                  refineType === "summary"
                    ? "border-accent-coral bg-accent-coral-light"
                    : "border-border"
                }`}
              >
                <div className="font-semibold text-sm mb-1 text-foreground">
                  Refine Summary Only
                </div>
                <div className="text-xs text-muted-foreground">
                  Improves phrasing and impact of your current summary text.
                </div>
              </button>
              <button
                onClick={() => setRefineType("full")}
                className={`flex-1 p-4 rounded-lg border text-left hover:border-accent-coral transition-all ${
                  refineType === "full"
                    ? "border-accent-coral bg-accent-coral-light"
                    : "border-border"
                }`}
              >
                <div className="font-semibold text-sm mb-1 text-foreground">
                  Generate from CV
                </div>
                <div className="text-xs text-muted-foreground">
                  Creates a new summary based on your experience and skills.
                </div>
              </button>
            </div>

            {refineType && (
              <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  placeholder="E.g., Focus on leadership, emphasize React skills, make it concise..."
                  className="w-full p-3 bg-card text-foreground text-sm border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none min-h-[80px] placeholder:text-muted-foreground/50"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={executeRefine}
                disabled={!refineType}
                className="px-4 py-2.5 bg-accent-coral text-white rounded-[10px] hover:bg-accent-coral/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-colors"
              >
                Generate Ideas
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
      <Dialog
        open={showRefineResults}
        onOpenChange={(open) =>
          !open && !isRefining && setShowRefineResults(false)
        }
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {isRefining ? "Refining Summary..." : "Choose a Version"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            {isRefining ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-accent-coral-light border-t-accent-coral rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SparkleIcon className="w-6 h-6 text-accent-coral" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-foreground">
                    Generating Improvements...
                  </p>
                  <p className="text-xs text-muted-foreground">
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
                    className="w-full text-left p-4 rounded-xl border border-border hover:border-accent-coral hover:bg-accent-coral-light/30 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-muted text-muted-foreground group-hover:bg-accent-coral-light group-hover:text-accent-coral transition-colors uppercase tracking-wider">
                        Option {idx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                      {option}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
