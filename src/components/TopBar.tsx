import { useRef } from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Undo2,
  Redo2,
  Save,
  MoreHorizontal,
  Sparkles,
  X,
  Share2,
  FilePlus,
  ArrowLeft,
} from "lucide-react";
import type { AppView } from "../App";
import {
  ExportAction,
  type ExportActionHandle,
} from "./editor/actions/ExportAction";
import {
  ImportAction,
  type ImportActionHandle,
} from "./editor/actions/ImportAction";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import type { CVData } from "../types";
import { trackEvent } from "../lib/utils";

interface TopBarProps {
  title: string;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
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

export function TopBar({
  title,
  currentView,
  onNavigate,
  data,
  setData,
  undo,
  redo,
  save,
  canUndo,
  canRedo,
  isAiChatOpen,
  setIsAiChatOpen,
}: Readonly<TopBarProps>) {
  const isEditor = currentView === "editor";
  const exportRef = useRef<ExportActionHandle>(null);
  const importRef = useRef<ImportActionHandle>(null);

  return (
    <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b bg-card px-6 print:hidden z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {!isEditor && (
        <button
          onClick={() => onNavigate("editor")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent-coral bg-accent-coral-light hover:bg-accent-coral/20 rounded-lg transition-all active:scale-95 mr-1"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Resume Editor</span>
        </button>
      )}
      <span className="font-semibold text-base flex-1">{title}</span>

      <div className="flex items-center gap-2">
        {/* Undo/Redo — editor only */}
        {isEditor && (
          <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5 border border-transparent hover:border-border transition-all">
            <button
              onClick={() => {
                undo();
                trackEvent("editor_undo");
              }}
              disabled={!canUndo}
              className="p-1.5 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
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
              className="p-1.5 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={16} className="text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Save — editor only */}
        {isEditor && (
          <button
            onClick={() => {
              save();
              trackEvent("editor_save");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground border rounded-md hover:bg-muted transition-all font-semibold text-xs shadow-sm active:scale-95"
          >
            <Save size={14} />
            <span className="hidden sm:inline">Save</span>
          </button>
        )}

        {/* Export — editor only */}
        {isEditor && (
          <button
            onClick={() => exportRef.current?.open()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all font-semibold text-xs shadow-sm active:scale-95"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        {/* AI Powered badge / toggle */}
        <button
          onClick={() => {
            setIsAiChatOpen(!isAiChatOpen);
            trackEvent("editor_toggle_ai_chat", { isOpen: !isAiChatOpen });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all active:scale-95 ${
            isAiChatOpen
              ? "bg-orange-600 text-white"
              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50"
          }`}
        >
          {isAiChatOpen ? <X size={12} /> : <Sparkles size={12} />}
          <span className="hidden sm:inline">
            {isAiChatOpen ? "Close AI" : "AI Powered"}
          </span>
        </button>

        {/* More dropdown — editor only */}
        {isEditor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg border bg-background hover:bg-muted text-muted-foreground transition-all active:scale-95 focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl shadow-xl border-muted/40"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Resume Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={() => importRef.current?.open()}
                className="bg-transparent! p-0 focus:bg-transparent"
              >
                <div className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                  <FilePlus size={14} /> Import CV
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ExportAction data={data} ref={exportRef} hideTrigger />
      <ImportAction setData={setData} ref={importRef} hideTrigger />
    </header>
  );
}
