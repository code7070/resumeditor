import { useState } from "react";
import { useCVData } from "./hooks/useCVData";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { Printer, Edit3, Eye } from "lucide-react";

function App() {
  const { data, setData } = useCVData();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans text-gray-900 print:bg-white print:block">
      {/* Mobile Tab Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] print:hidden">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex flex-col items-center p-2 rounded-md flex-1 ${
            activeTab === "edit"
              ? "text-emerald-700 bg-emerald-50"
              : "text-gray-500"
          }`}
        >
          <Edit3 size={20} />
          <span className="text-[10px] font-medium mt-1">Editor</span>
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex flex-col items-center p-2 rounded-md flex-1 ${
            activeTab === "preview"
              ? "text-emerald-700 bg-emerald-50"
              : "text-gray-500"
          }`}
        >
          <Eye size={20} />
          <span className="text-[10px] font-medium mt-1">Preview</span>
        </button>
      </div>

      {/* Editor Pane */}
      <div
        className={`${
          activeTab === "edit" ? "block" : "hidden"
        } md:block w-full md:w-[450px] lg:w-[500px] bg-white border-r border-gray-200 h-[calc(100vh-60px)] md:h-screen md:sticky md:top-0 overflow-hidden flex flex-col print:hidden z-10 shadow-xl md:shadow-none pb-20 md:pb-0`}
      >
        <Editor data={data} setData={setData} />
      </div>

      {/* Preview Pane */}
      <div
        className={`${
          activeTab === "preview" ? "block" : "hidden"
        } md:block flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-60px)] md:h-screen bg-gray-100 relative print:p-0 print:bg-white print:overflow-visible print:h-auto print:block`}
      >
        <div className="max-w-[210mm] mx-auto print:py-0 shadow-sm print:shadow-none bg-white min-h-[297mm] print:m-0 print:w-full">
          <Preview data={data} />
        </div>

        {/* Floating Print Button */}
        <button
          onClick={handlePrint}
          className="fixed bottom-20 md:bottom-8 right-8 bg-emerald-700 text-white p-4 rounded-full shadow-xl hover:bg-emerald-800 transition-all hover:scale-105 print:hidden group z-40 flex items-center gap-2"
          title="Print / Save as PDF"
        >
          <Printer size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium whitespace-nowrap">
            Print Layout
          </span>
        </button>
      </div>
    </div>
  );
}

export default App;
