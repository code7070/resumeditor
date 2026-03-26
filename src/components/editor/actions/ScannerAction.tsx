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
  Loader2,
} from "lucide-react";
import { AiConsentDialog } from "../../ui/AiConsentDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/Dialog";
import { ConfirmDialog } from "../../ui/ConfirmDialog";
import { ATSAnalysisArt } from "../../ATSAnalysisArt";
import { Button } from "../../ui/button";

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

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { bg: "bg-positive-bg", text: "text-positive-green" };
    if (score >= 60) return { bg: "bg-warning-bg", text: "text-warning-yellow" };
    return { bg: "bg-error-bg", text: "text-error-red" };
  };

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={openATSDialog}
          className="group flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors text-xs font-semibold border border-border w-full"
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
        {isAnalyzingATS ? (
          /* Loading State — w=400 centered */
          <DialogContent className="sm:max-w-[400px]" showCloseButton={false}>
            <div className="p-10 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-accent-coral animate-spin" />
              <div className="text-center space-y-2">
                <p className="text-base font-semibold text-foreground">
                  Measuring Data Resonance...
                </p>
                <p className="text-[13px] text-muted-foreground max-w-[260px]">
                  AI is currently analyzing your CV. This may take a moment...
                </p>
              </div>
            </div>
          </DialogContent>
        ) : (
          /* Report / History — w=720 */
          <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>ATS Analysis Report</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {viewingHistoryItem ? (
                <ATSAnalysisArt
                  result={viewingHistoryItem.result}
                  timestamp={viewingHistoryItem.timestamp}
                  onBack={() => setViewingHistoryItem(null)}
                />
              ) : atsResult ? (
                <ATSAnalysisArt
                  result={atsResult}
                  timestamp={Date.now()}
                  onBack={
                    atsHistory.length > 1
                      ? () => setViewingHistoryItem(null)
                      : undefined
                  }
                />
              ) : (
                /* History List */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-accent-coral rounded-full" />
                      <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                        Recent Scans
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowConsentDialog(true)}
                      className="text-xs font-semibold text-accent-coral hover:text-accent-coral/80"
                    >
                      New Scan
                    </button>
                  </div>
                  {atsHistory.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <p className="text-sm">No scan history found.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {atsHistory.map((item) => {
                        const badge = getScoreBadge(item.result.score);
                        return (
                          <button
                            key={item.id}
                            onClick={() => setViewingHistoryItem(item)}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent-coral/50 hover:bg-muted/50 transition-all group text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${badge.bg} ${badge.text}`}
                              >
                                {Math.round(item.result.score)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  ATS Assessment
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(item.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <ArrowRight
                              size={14}
                              className="text-muted-foreground/40 group-hover:text-foreground transition-colors"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              {(atsResult || viewingHistoryItem) && (
                <Button
                  variant="secondary"
                  onClick={() => setShowRescanConfirm(true)}
                >
                  <ListRestart size={14} />
                  Re-Scan
                </Button>
              )}
              <Button onClick={() => setShowATSDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
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
        message="A new scan will perform a fresh analysis of your current resume. This will not delete your past history, but it will replace the current active report view."
        confirmLabel="Start Scan"
        isDestructive={false}
        onConfirm={() => {
          setShowRescanConfirm(false);
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
