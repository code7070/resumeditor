import { useCVData } from "./hooks/useCVData";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./components/ui/ThemeToggle";

export function App() {
  const { data, setData } = useCVData();

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Panel */}
        <aside className="w-[450px] lg:w-[500px] shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Editor
            </h2>
            <ThemeToggle />
          </div>
          <Editor data={data} setData={setData} />
        </aside>

        {/* Preview Pane */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950 p-10">
          <Preview data={data} />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
