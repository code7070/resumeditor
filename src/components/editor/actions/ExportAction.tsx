import { useState, forwardRef, useImperativeHandle } from "react";
import { trackEvent } from "../../../lib/utils";
import type { CVData } from "../../../types";
import {
  generateMarkdown,
  generateLatex,
  generateDocx,
} from "../../../utils/exporters";
import {
  Share2,
  Printer,
  FileJson,
  FileText,
  FileCode,
  FileType,
  Check,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/Dialog";
import { Button } from "../../ui/button";

export interface ExportActionHandle {
  open: () => void;
}

interface ExportActionProps {
  data: CVData;
  hideTrigger?: boolean;
}

export const ExportAction = forwardRef<ExportActionHandle, ExportActionProps>(
  ({ data, hideTrigger = false }, ref) => {
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [copyStatus, setCopyStatus] = useState<
      "idle" | "md" | "tex" | "json" | "docx"
    >("idle");

    useImperativeHandle(ref, () => ({
      open: () => {
        setShowExportDialog(true);
        trackEvent("export_dialog_open");
      },
    }));

    const handleExport = (type: "md" | "tex" | "json") => {
      trackEvent("export_click", { type });
      let content: string;
      if (type === "json") {
        content = JSON.stringify(data, null, 2);
      } else if (type === "md") {
        content = generateMarkdown(data);
      } else {
        content = generateLatex(data);
      }
      navigator.clipboard.writeText(content);
      setCopyStatus(type);
      setTimeout(() => setCopyStatus("idle"), 2000);
    };

    const handleExportDocx = async () => {
      trackEvent("export_click", { type: "docx" });
      await generateDocx(data);
    };

    const handleExportPDF = () => {
      trackEvent("export_pdf_print");
      setShowExportDialog(false);
      setTimeout(() => {
        window.print();
      }, 300);
    };

    const exportOptions = [
      {
        key: "pdf" as const,
        icon: Printer,
        iconColor: "text-accent-coral",
        iconBg: "bg-accent-coral-light",
        title: "Print / Save as PDF",
        desc: "Use browser's print dialog to save as PDF",
        onClick: handleExportPDF,
      },
      {
        key: "docx" as const,
        icon: FileType,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50 dark:bg-blue-900/20",
        title: "Download as Word",
        desc: "Download as an editable Word document",
        onClick: handleExportDocx,
      },
      {
        key: "json" as const,
        icon: FileJson,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-50 dark:bg-amber-900/20",
        title: "Copy as JSON",
        desc: "Copy your resume data as structured JSON to clipboard",
        onClick: () => handleExport("json"),
      },
      {
        key: "md" as const,
        icon: FileText,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
        title: "Export as Markdown",
        desc: "Download your resume as plain-text Markdown file",
        onClick: () => handleExport("md"),
      },
      {
        key: "tex" as const,
        icon: FileCode,
        iconColor: "text-purple-600",
        iconBg: "bg-purple-50 dark:bg-purple-900/20",
        title: "Copy LaTeX",
        desc: "Copy as LaTeX format",
        onClick: () => handleExport("tex"),
      },
    ];

    return (
      <>
        {!hideTrigger && (
          <button
            onClick={() => {
              setShowExportDialog(true);
              trackEvent("export_dialog_open");
            }}
            className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors text-xs font-medium border border-border w-full"
          >
            <Share2 size={14} /> Export
          </button>
        )}

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-[780px]">
            <DialogHeader>
              <DialogTitle>Export Resume</DialogTitle>
            </DialogHeader>
            <div className="px-6 py-4 space-y-2">
              {exportOptions.map((opt) => {
                const Icon = opt.icon;
                const isCopied =
                  opt.key !== "pdf" && copyStatus === opt.key;

                return (
                  <button
                    key={opt.key}
                    onClick={opt.onClick}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent-coral/50 hover:bg-muted/50 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${opt.iconBg} ${opt.iconColor}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <span className="block text-[15px] font-medium text-foreground">
                          {opt.title}
                        </span>
                        <span className="block text-[13px] text-muted-foreground">
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                    {isCopied ? (
                      <Check size={18} className="text-accent-coral" />
                    ) : (
                      <ChevronRight
                        size={18}
                        className="text-muted-foreground/40 group-hover:text-foreground transition-colors"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowExportDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);
ExportAction.displayName = "ExportAction";
