import { useCVData } from "./hooks/useCVData";
import { Preview } from "./components/Preview";
import { ThemeProvider } from "./context/ThemeContext";
import { useRef, useState } from "react";
import { EditorActions } from "./components/editor/EditorActions";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { Separator } from "./components/ui/separator";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import { AiChat } from "./components/AiChat";

export function App() {
  const { data, setData, undo, redo, save, canUndo, canRedo } = useCVData();
  const previewRef = useRef<HTMLDivElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  const confirmDelete = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  // Handler for AI Chat to update CV data
  const handleUpdateCV = (updates: Partial<typeof data>) => {
    setData((prevData) => ({
      ...prevData,
      ...updates,
    }));
  };

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar
          data={data}
          setData={setData}
          confirmDelete={confirmDelete}
        />
        <SidebarInset>
          <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 print:hidden">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between">
              <span className="font-semibold text-sm">Editor</span>
              <EditorActions
                data={data}
                setData={setData}
                undo={undo}
                redo={redo}
                save={save}
                canUndo={canUndo}
                canRedo={canRedo}
                isAiChatOpen={isAiChatOpen}
                setIsAiChatOpen={setIsAiChatOpen}
              />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:overflow-hidden print:p-0 print:block">
            {/* Preview Column */}
            <main
              className={`flex-1 overflow-y-auto bg-muted/20 p-4 print:border-none print:p-0 print:overflow-visible transition-all ${
                isAiChatOpen ? "lg:mr-96" : ""
              }`}
            >
              <Preview ref={previewRef} data={data} />
            </main>

            {/* AI Chat Right Sidebar */}
            {isAiChatOpen && (
              <aside className="hidden lg:block fixed right-0 top-14 bottom-0 w-96 border-l bg-background shadow-2xl z-10 print:hidden">
                <AiChat
                  data={data}
                  onClose={() => setIsAiChatOpen(false)}
                  onUpdateCV={handleUpdateCV}
                />
              </aside>
            )}
          </div>
        </SidebarInset>

        {/* Mobile AI Chat Sheet - Only on small screens */}
        {isAiChatOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <AiChat
              data={data}
              onClose={() => setIsAiChatOpen(false)}
              onUpdateCV={handleUpdateCV}
            />
          </div>
        )}

        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          onConfirm={deleteConfirm.onConfirm}
          onClose={() =>
            setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
          }
        />
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
