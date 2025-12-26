import { useCVData } from "./hooks/useCVData";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { useRef } from "react";

export function App() {
  const { data, setData } = useCVData();
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        {/* Sidebar Panel */}
        <aside className="w-[450px] lg:w-[500px] shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 print:hidden">
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Editor
            </h2>
            <ThemeToggle />
          </div>
          <Editor data={data} setData={setData} previewRef={previewRef} />
        </aside>

        {/* Preview Pane */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950 p-10 print:p-0 print:overflow-visible print:bg-white print:block">
          <Preview ref={previewRef} data={data} />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
