import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { trackEvent, ensureHtmlFormat } from "../../../lib/utils";
import type { CVData } from "../../../types";
import { SparkleIcon } from "../../icons/SparkleIcon";
import { parseResumeFromPdf } from "../../../services/gemini";
import { Upload, Loader2, FilePlus, SparklesIcon } from "lucide-react";
import { AiConsentDialog } from "../../ui/AiConsentDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/Dialog";
import { Button } from "../../ui/button";

const formatImportedData = (data: Partial<CVData>): Partial<CVData> => {
  const formatted = { ...data };

  // Format Summary
  if (formatted.summary) {
    formatted.summary = ensureHtmlFormat(formatted.summary);
  }

  // Format Custom Sections
  if (Array.isArray(formatted.customSections)) {
    formatted.customSections = formatted.customSections.map((section) => ({
      ...section,
      items: Array.isArray(section.items)
        ? section.items.map((item) => ({
            ...item,
            description: ensureHtmlFormat(item.description),
          }))
        : [],
    }));
  }

  return formatted;
};

export interface ImportActionHandle {
  open: () => void;
}

interface ImportActionProps {
  setData: React.Dispatch<React.SetStateAction<CVData>>;
  hideTrigger?: boolean;
}

export const ImportAction = forwardRef<ImportActionHandle, ImportActionProps>(
  ({ setData, hideTrigger = false }, ref) => {
    const [isImporting, setIsImporting] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showImportConsent, setShowImportConsent] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        setShowUploadDialog(true);
        trackEvent("import_dialog_open");
      },
    }));

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
          const formatted = formatImportedData(json);
          setData((prev) => ({ ...prev, ...formatted }));
          setIsImporting(false);
          setShowUploadDialog(false);
          trackEvent("import_success", { type: "json" });
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
              const formatted = formatImportedData(parsedData);
              setData((prev) => ({ ...prev, ...formatted }));
              setShowUploadDialog(false);
              trackEvent("import_success", { type: "pdf_ai" });
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
        {!hideTrigger && (
          <button
            onClick={() => {
              setShowUploadDialog(true);
              trackEvent("import_dialog_open");
            }}
            className="group flex items-center gap-2 px-3 py-2 bg-accent-coral-light text-accent-coral rounded-md hover:bg-accent-coral-light/80 transition-colors text-xs font-semibold border border-accent-coral/20 w-full"
          >
            <div className="relative size-[16px] overflow-hidden">
              <FilePlus
                size={14}
                className="transition-all group-hover:-translate-y-full"
              />
              <SparklesIcon
                size={14}
                className="transition-all group-hover:-translate-y-full"
              />
            </div>
            Import
          </button>
        )}

        {/* Upload Dialog */}
        <Dialog
          open={showUploadDialog}
          onOpenChange={(open) =>
            !isImporting && !open && setShowUploadDialog(false)
          }
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Import Resume</DialogTitle>
            </DialogHeader>
            <div className="px-6 py-4 space-y-4">
              <div // nosonar
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (!isImporting) fileInputRef.current?.click();
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isImporting
                    ? "border-accent-coral/30 bg-accent-coral-light/50"
                    : "border-border hover:border-accent-coral hover:bg-muted/50 cursor-pointer"
                }`}
                onClick={() => !isImporting && fileInputRef.current?.click()}
              >
                {isImporting ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-accent-coral animate-spin" />
                    <div className="space-y-1">
                      <p className="text-[15px] font-medium text-foreground">
                        Analyzing your resume...
                      </p>
                      <p className="text-[13px] text-muted-foreground">
                        This might take a few seconds
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-coral-light flex items-center justify-center text-accent-coral">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[15px] font-medium text-foreground">
                        Click to upload a file
                      </p>
                      <p className="text-[13px] text-muted-foreground">
                        Supported: PDF, JSON, MD, TXT
                      </p>
                    </div>
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
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-800">
                <div className="text-blue-600 mt-0.5">
                  <SparkleIcon className="w-4 h-4" />
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  <span className="font-semibold block mb-1">
                    AI Extract Feature
                  </span>
                  Upload your existing PDF resume and we'll use Gemini AI to
                  intelligently extract and format your information
                  automatically.
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowUploadDialog(false)}
                disabled={isImporting}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AiConsentDialog
          isOpen={showImportConsent}
          onClose={() => {
            setShowImportConsent(false);
            setPendingFile(null);
          }}
          onConfirm={() => {
            if (pendingFile) {
              handleFileUpload(pendingFile);
            }
          }}
          title="AI Processing Consent"
          description="To extract information from your resume, we use Google Gemini AI
              to intelligently parse and structure your data. Your file is
              processed securely and not stored permanently."
          confirmLabel="Proceed with Import"
          consentItems={[
            {
              id: "data_upload",
              label: "I consent to upload my resume file for AI processing.",
            },
            {
              id: "ai_processing",
              label:
                "I understand that AI will extract information from my resume.",
            },
          ]}
        />
      </>
    );
  }
);
ImportAction.displayName = "ImportAction";
