import { useCVData } from "./hooks/useCVData";
import { Preview } from "./components/Preview";
import { ThemeProvider } from "./context/ThemeContext";
import { useRef, useState } from "react";
import { TopBar } from "./components/TopBar";
import {
  SidebarInset,
  SidebarProvider,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import { AiChat } from "./components/AiChat";
import {
  ScannerAction,
  type ScannerActionHandle,
} from "./components/editor/actions/ScannerAction";
import { LetterView } from "./components/letter/LetterView";
import { TrackerView } from "./components/tracker/TrackerView";

export type AppView = "editor" | "letter" | "tracker";

const VIEW_TITLES: Record<AppView, string> = {
  editor: "Resume Editor",
  letter: "Application Letter",
  tracker: "Application Tracker",
};

export function App() {
  const { data, setData, undo, redo, save, canUndo, canRedo } = useCVData();
  const [currentView, setCurrentView] = useState<AppView>("editor");
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const scannerRef = useRef<ScannerActionHandle>(null);

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

  const confirmDelete = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setDeleteConfirm({ isOpen: true, title, message, onConfirm });
  };

  const handleUpdateCV = (updates: Partial<typeof data>) => {
    setData((prevData) => ({ ...prevData, ...updates }));
  };

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar
          data={data}
          setData={setData}
          confirmDelete={confirmDelete}
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenScanner={() => scannerRef.current?.open()}
        />
        <SidebarInset>
          <TopBar
            title={VIEW_TITLES[currentView]}
            currentView={currentView}
            onNavigate={setCurrentView}
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

          <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:overflow-hidden print:p-0 print:block">
            <main
              className={`flex-1 overflow-y-auto bg-page print:border-none print:p-0 print:overflow-visible transition-all ${
                isAiChatOpen ? "lg:mr-96" : ""
              }`}
            >
              {currentView === "editor" && (
                <div className="flex justify-center p-8">
                  <Preview data={data} />
                </div>
              )}
              {currentView === "letter" && (
                <LetterView cvData={data} />
              )}
              {currentView === "tracker" && <TrackerView />}
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

        {/* Mobile AI Chat */}
        {isAiChatOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <AiChat
              data={data}
              onClose={() => setIsAiChatOpen(false)}
              onUpdateCV={handleUpdateCV}
            />
          </div>
        )}

        <ScannerAction data={data} ref={scannerRef} hideTrigger />

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
