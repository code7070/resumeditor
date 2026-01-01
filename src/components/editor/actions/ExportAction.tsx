import { useState } from "react";
import { trackEvent } from "../../../lib/utils";
import type { CVData } from "../../../types";
import { generateMarkdown, generateLatex } from "../../../utils/exporters";
import {
  Share2,
  Printer,
  Download,
  FileJson,
  FileText,
  FileCode,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/Dialog";

interface ExportActionProps {
  data: CVData;
}

export function ExportAction({ data }: ExportActionProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "md" | "tex" | "json">(
    "idle"
  );

  const handleExport = (type: "md" | "tex" | "json") => {
    trackEvent("export_click", { type });
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

  const handleExportPDF = () => {
    trackEvent("export_pdf_print");
    // Use native browser print which is more reliable for Tailwind v4 colors
    window.print();
    setShowExportDialog(false);
  };

  return (
    <>
      <button
        onClick={() => {
          setShowExportDialog(true);
          trackEvent("export_dialog_open");
        }}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium border border-gray-200 dark:border-gray-700 w-full"
      >
        <Share2 size={14} /> Export
      </button>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-lg transition-colors group text-left border border-emerald-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-md shadow-sm text-emerald-700 ring-1 ring-emerald-200">
                  <Printer size={20} />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-900">
                    Print / Save as PDF
                  </span>
                  <span className="block text-xs text-gray-600">
                    Use system dialog to save as PDF
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
        </DialogContent>
      </Dialog>
    </>
  );
}
