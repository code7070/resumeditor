import { useState } from "react";
import { ArrowLeft, Loader2, Upload, Pencil, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { generateApplicationLetter } from "../../services/gemini";
import type { CVData } from "../../types";

interface LetterFormProps {
  cvData: CVData;
  onBack: () => void;
  onGenerated: (letter: {
    companyName: string;
    position: string;
    jobDescription: string;
    content: string;
  }) => void;
}

type InputMode = "manual" | "upload";
type JDInputMode = "paste" | "upload";

export function LetterForm({ cvData, onBack, onGenerated }: LetterFormProps) {
  const [mode, setMode] = useState<InputMode>("manual");
  const [jdMode, setJdMode] = useState<JDInputMode>("paste");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [useAiEnhance, setUseAiEnhance] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setJobDescription(text);
      setJdMode("paste"); // Switch to paste to show content
    } catch {
      setError("Failed to read file");
    }
    e.target.value = "";
  };

  const handleGenerate = async () => {
    if (!companyName.trim() || !position.trim() || !jobDescription.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      const content = await generateApplicationLetter({
        cvData,
        companyName: companyName.trim(),
        position: position.trim(),
        jobDescription: jobDescription.trim(),
        additionalNotes: additionalNotes.trim() || undefined,
        useAiEnhance,
      });
      onGenerated({
        companyName: companyName.trim(),
        position: position.trim(),
        jobDescription: jobDescription.trim(),
        content,
      });
    } catch {
      setError("Failed to generate letter. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-[22px] font-bold text-foreground">
          Create Application Letter
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate a professional application letter based on your resume and the
          job description.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMode("manual")}
          className={`p-5 rounded-xl border text-left transition-all ${
            mode === "manual"
              ? "border-accent-coral bg-accent-coral-light ring-1 ring-accent-coral/20"
              : "border-border bg-card hover:border-accent-coral/50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent-coral-light flex items-center justify-center shrink-0">
              <Pencil size={20} className="text-accent-coral" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">
                Manual Input
              </div>
              <p className="text-xs text-muted-foreground">
                Type or paste your details manually
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`p-5 rounded-xl border text-left transition-all ${
            mode === "upload"
              ? "border-accent-coral bg-accent-coral-light ring-1 ring-accent-coral/20"
              : "border-border bg-card hover:border-accent-coral/50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent-coral-light flex items-center justify-center shrink-0">
              <Upload size={20} className="text-accent-coral" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">
                Upload File
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a job description document
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
              placeholder="e.g. Google"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
              Position
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Job Description
          </label>

          {mode === "manual" ? (
            <>
              {/* Tab bar */}
              <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
                <button
                  onClick={() => setJdMode("paste")}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    jdMode === "paste"
                      ? "bg-card shadow-sm text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Paste Text
                </button>
                <button
                  onClick={() => setJdMode("upload")}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    jdMode === "upload"
                      ? "bg-card shadow-sm text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload File
                </button>
              </div>

              {jdMode === "paste" ? (
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none min-h-[150px] resize-none text-sm placeholder:text-muted-foreground/50 leading-relaxed"
                  placeholder="Paste the job description here..."
                />
              ) : (
                <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent-coral hover:bg-muted/50 transition-colors">
                  <Upload size={24} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload a text file
                  </span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </>
          ) : (
            <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent-coral hover:bg-muted/50 transition-colors">
              <Upload size={24} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Click to upload job description
              </span>
              <span className="text-xs text-muted-foreground">
                Supports TXT, MD files
              </span>
              <input
                type="file"
                accept=".txt,.md"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
          Additional Notes
        </label>
        <input
          type="text"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
          placeholder="e.g. Available from April, salary expectation $XXk..."
        />
      </div>

      {/* AI Enhance Toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={useAiEnhance}
            onChange={(e) => setUseAiEnhance(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-muted rounded-full peer-checked:bg-accent-coral transition-colors" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
        </div>
        <span className="text-sm text-foreground">Use AI to enhance writing</span>
        <Sparkles size={14} className="text-accent-coral" />
      </label>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Letter"
          )}
        </Button>
      </div>
    </div>
  );
}
