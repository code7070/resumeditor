import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { trackEvent } from "../../../lib/utils";
import type { CVData } from "../../../types";
import {
  analyzeATSScore,
  type ATSAnalysisResult,
} from "../../../services/gemini";
import {
  ShieldCheck,
  SparklesIcon,
  ListRestart,
  ArrowRight,
} from "lucide-react";
import { AiConsentDialog } from "../../ui/AiConsentDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/Dialog";
import { ConfirmDialog } from "../../ui/ConfirmDialog";
import { ATSAnalysisArt } from "../../ATSAnalysisArt";

interface ATSHistoryItem {
  id: string;
  timestamp: number;
  result: ATSAnalysisResult;
}

export interface ScannerActionHandle {
  open: () => void;
}

interface ScannerActionProps {
  data: CVData;
  hideTrigger?: boolean;
}

export const ScannerAction = forwardRef<
  ScannerActionHandle,
  ScannerActionProps
>(({ data, hideTrigger = false }, ref) => {
  const [showATSDialog, setShowATSDialog] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [atsHistory, setAtsHistory] = useState<ATSHistoryItem[]>([]);
  const [viewingHistoryItem, setViewingHistoryItem] =
    useState<ATSHistoryItem | null>(null);
  const [showRescanConfirm, setShowRescanConfirm] = useState(false);

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

  const handleAnalyzeATS = async () => {
    trackEvent("scanner_analyze_start");
    setIsAnalyzingATS(true);
    setShowATSDialog(true);
    setAtsResult(null);
    setViewingHistoryItem(null);
    try {
      const result = await analyzeATSScore(data);
      trackEvent("scanner_analyze_success", { score: result.score });
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
    // Show consent gate only if no result exists and no history
    trackEvent("scanner_dialog_open");
    if (!atsResult && atsHistory.length === 0) {
      setShowConsentDialog(true);
    } else {
      setShowATSDialog(true);
    }
  };

  useImperativeHandle(ref, () => ({
    open: openATSDialog,
  }));

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={openATSDialog}
          className="group flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-semibold border border-blue-200 dark:border-blue-800 w-full"
        >
          <div className="relative size-[16px] overflow-hidden">
            <ShieldCheck
              size={14}
              className="transition-all group-hover:-translate-y-full"
            />
            <SparklesIcon
              size={14}
              className="transition-all group-hover:-translate-y-full"
            />
          </div>
          Scanner ATS
        </button>
      )}

      {/* ATS Result Dialog */}
      <Dialog
        open={showATSDialog}
        onOpenChange={(open) =>
          !isAnalyzingATS && !open && setShowATSDialog(false)
        }
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>ATS Analysis Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar -mx-2 px-2 flex-1">
            {isAnalyzingATS ? (
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
                    onClick={() => setShowConsentDialog(true)}
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
        </DialogContent>
      </Dialog>

      <AiConsentDialog
        isOpen={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        onConfirm={() => {
          setShowConsentDialog(false);
          handleAnalyzeATS();
        }}
        title="AI Processing Consent"
        description="To provide high-quality ATS scoring, we use Google Gemini AI
                  to analyze your resume content. Your data is processed
                  securely and not stored permanently on our servers."
        confirmLabel="Start Scanning"
        icon="shield"
        consentItems={[
          {
            id: "data_share",
            label:
              "I am okay to send my information (Contact, Experience, Skills) for processing.",
          },
          {
            id: "ai_eval",
            label:
              "I understand that an AI will evaluate my resume against industry standards.",
          },
        ]}
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
    </>
  );
});
ScannerAction.displayName = "ScannerAction";
