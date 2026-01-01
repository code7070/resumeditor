import { useRef } from "react";
import type { CVData } from "../../types";
import { trackEvent } from "../../lib/utils";
import { ImportAction, type ImportActionHandle } from "./actions/ImportAction";
import { ExportAction, type ExportActionHandle } from "./actions/ExportAction";
import {
  ScannerAction,
  type ScannerActionHandle,
} from "./actions/ScannerAction";
import {
  Undo2,
  Redo2,
  Save,
  MoreHorizontal,
  MessageSquare,
  X,
  FilePlus,
  Sparkles as SparklesIcon,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { formatRelative } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";

interface EditorActionsProps {
  data: CVData;
  setData: (update: CVData | ((prev: CVData) => CVData)) => void;
  undo: () => void;
  redo: () => void;
  save: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isAiChatOpen: boolean;
  setIsAiChatOpen: (open: boolean) => void;
}

export function EditorActions({
  data,
  setData,
  undo,
  redo,
  save,
  canUndo,
  canRedo,
  isAiChatOpen,
  setIsAiChatOpen,
}: Readonly<EditorActionsProps>) {
  const formatted = data.lastSaved
    ? formatRelative(new Date(data.lastSaved), new Date())
    : "";

  const importRef = useRef<ImportActionHandle>(null);
  const exportRef = useRef<ExportActionHandle>(null);
  const scannerRef = useRef<ScannerActionHandle>(null);

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {data.lastSaved && (
        <span className="text-[10px] text-muted-foreground hidden lg:inline-block">
          Saved: {formatted}
        </span>
      )}

      {/* Undo/Redo Group */}
      <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 rounded-lg p-0.5 border border-transparent hover:border-border transition-all">
        <button
          onClick={() => {
            undo();
            trackEvent("editor_undo");
          }}
          disabled={!canUndo}
          className="p-1.5 sm:p-2 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} className="text-muted-foreground" />
        </button>
        <button
          onClick={() => {
            redo();
            trackEvent("editor_redo");
          }}
          disabled={!canRedo}
          className="p-1.5 sm:p-2 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Main Save Action */}
      <button
        onClick={() => {
          save();
          trackEvent("editor_save");
        }}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all font-semibold text-xs shadow-sm hover:shadow active:scale-95"
      >
        <Save size={14} className="sm:size-4" />
        <span>Save</span>
      </button>

      {/* AI Assistant Button */}
      <button
        onClick={() => {
          setIsAiChatOpen(!isAiChatOpen);
          trackEvent("editor_toggle_ai_chat", { isOpen: !isAiChatOpen });
        }}
        className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-all font-semibold text-xs shadow-sm hover:shadow active:scale-95 ${
          isAiChatOpen
            ? "bg-orange-700 text-white"
            : "bg-orange-600 text-white hover:bg-orange-700"
        }`}
      >
        {isAiChatOpen ? (
          <X size={14} className="sm:size-4" />
        ) : (
          <MessageSquare size={14} className="sm:size-4" />
        )}
        <span className="hidden sm:inline">
          {isAiChatOpen ? "Close" : ""} AI {isAiChatOpen ? "" : "Assistant"}
        </span>
      </button>

      {/* Secondary Actions Dropdown */}
      <DropdownMenu
        onOpenChange={(open) =>
          trackEvent("editor_menu_toggle", { isOpen: open })
        }
      >
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 sm:p-2 rounded-lg border bg-background hover:bg-muted text-muted-foreground transition-all active:scale-95 focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
            <MoreHorizontal size={16} className="sm:size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl shadow-xl border-muted/40"
        >
          <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Resume Actions
          </DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => importRef.current?.open()}
            className="bg-transparent! p-0 focus:bg-transparent"
          >
            <div className="w-full cursor-pointer group flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
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
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => exportRef.current?.open()}
            className="bg-transparent! p-0 focus:bg-transparent mt-1"
          >
            <div className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium border border-gray-200 dark:border-gray-700">
              <Share2 size={14} /> Export
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Optimization
          </DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => scannerRef.current?.open()}
            className="bg-transparent! p-0 focus:bg-transparent"
          >
            <div className="w-full cursor-pointer group flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-semibold border border-blue-200 dark:border-blue-800">
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
            </div>
          </DropdownMenuItem>

          {data.lastSaved && (
            <>
              <DropdownMenuSeparator className="my-1" />
              <div className="px-3 py-2">
                <p className="text-[10px] text-muted-foreground leading-tight italic">
                  Last save status:
                  <br /> {formatted}
                </p>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ImportAction setData={setData} ref={importRef} hideTrigger />
      <ExportAction data={data} ref={exportRef} hideTrigger />
      <ScannerAction data={data} ref={scannerRef} hideTrigger />
    </div>
  );
}
