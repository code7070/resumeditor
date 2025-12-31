import type { CVData } from "../../types";
import { ImportAction } from "./actions/ImportAction";
import { ExportAction } from "./actions/ExportAction";
import { ScannerAction } from "./actions/ScannerAction";
import { Undo2, Redo2, Save, MoreHorizontal } from "lucide-react";
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
}

export function EditorActions({
  data,
  setData,
  undo,
  redo,
  save,
  canUndo,
  canRedo,
}: Readonly<EditorActionsProps>) {
  const formatted = formatRelative(new Date(data.lastSaved || ""), new Date());

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
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 sm:p-2 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} className="text-muted-foreground" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 sm:p-2 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Main Save Action */}
      <button
        onClick={save}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold text-xs shadow-sm hover:shadow active:scale-95"
      >
        <Save size={14} className="sm:size-4" />
        <span>Save</span>
      </button>

      {/* Secondary Actions Dropdown */}
      <DropdownMenu>
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
            onSelect={(e) => e.preventDefault()}
            className="bg-transparent!"
          >
            <ImportAction setData={setData} />
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="bg-transparent!"
          >
            <ExportAction data={data} />
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Optimization
          </DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="bg-transparent!"
          >
            <ScannerAction data={data} />
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
    </div>
  );
}
