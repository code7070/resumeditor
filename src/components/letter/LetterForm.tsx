import { useState, useRef } from "react";
import {
  ArrowLeft,
  Pencil,
  CloudUpload,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Mic,
  PenTool,
  Globe,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import type { CVData, WritingTone, LanguageStyle, LetterLanguage, UploadedFile } from "../../types";

export interface LetterFormData {
  companyName: string;
  position: string;
  jobDescription: string;
  additionalNotes?: string;
  writingTone: WritingTone;
  languageStyle: LanguageStyle;
  language: LetterLanguage;
  uploadedFiles?: UploadedFile[];
}

interface LetterFormProps {
  cvData: CVData;
  onBack: () => void;
  onSubmit: (data: LetterFormData) => void;
  initialData?: Partial<LetterFormData>;
}

type InputMode = "manual" | "upload";

async function fileToUploadedFile(file: File): Promise<UploadedFile> {
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
  });

  const uploadedFile: UploadedFile = {
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    base64Data,
  };

  if (file.type === "text/plain") {
    uploadedFile.textContent = await file.text();
  }

  return uploadedFile;
}

const TONE_OPTIONS: { value: WritingTone; label: string; subtitle: string }[] = [
  { value: "formal", label: "Formal", subtitle: "Traditional & structured" },
  { value: "professional", label: "Professional", subtitle: "Business-appropriate" },
  { value: "casual", label: "Casual", subtitle: "Warm & conversational" },
];

const STYLE_OPTIONS: { value: LanguageStyle; label: string; subtitle: string }[] = [
  { value: "straightforward", label: "Straightforward", subtitle: "Clear and direct" },
  { value: "polished", label: "Polished & Compelling", subtitle: "Highlights achievements persuasively" },
  { value: "creative", label: "Creative & Bold", subtitle: "Distinctive and memorable" },
];

const LANGUAGE_OPTIONS: { value: LetterLanguage; label: string; subtitle: string }[] = [
  { value: "auto", label: "Auto-detect", subtitle: "Match job description language" },
  { value: "english", label: "English", subtitle: "Write in English" },
  { value: "indonesian", label: "Indonesian", subtitle: "Write in Bahasa Indonesia" },
];

// Labels used in collapsed summary (shorter)
const TONE_SUMMARY: Record<WritingTone, string> = {
  formal: "Formal",
  professional: "Professional",
  casual: "Casual",
};
const STYLE_SUMMARY: Record<LanguageStyle, string> = {
  straightforward: "Straightforward",
  polished: "Polished",
  creative: "Creative",
};
const LANGUAGE_SUMMARY: Record<LetterLanguage, string> = {
  auto: "Auto-detect",
  english: "English",
  indonesian: "Indonesian",
};

function RadioCards<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; subtitle: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-3.5 px-4 rounded-lg text-left transition-all ${
            value === opt.value
              ? "border-2 border-accent-coral bg-accent-coral-light"
              : "border border-border bg-card hover:border-accent-coral/50"
          }`}
        >
          <p className={`text-sm font-semibold leading-tight ${value === opt.value ? "text-accent-coral" : "text-foreground"}`}>
            {opt.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-tight">{opt.subtitle}</p>
        </button>
      ))}
    </div>
  );
}

export function LetterForm({ onBack, onSubmit, initialData }: LetterFormProps) {
  const [mode, setMode] = useState<InputMode>("manual");
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? "");
  const [position, setPosition] = useState(initialData?.position ?? "");
  const [jobDescription, setJobDescription] = useState(initialData?.jobDescription ?? "");
  const [additionalNotes, setAdditionalNotes] = useState(initialData?.additionalNotes ?? "");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialData?.uploadedFiles ?? []);
  const [writingTone, setWritingTone] = useState<WritingTone>(initialData?.writingTone ?? "formal");
  const [languageStyle, setLanguageStyle] = useState<LanguageStyle>(initialData?.languageStyle ?? "straightforward");
  const [language, setLanguage] = useState<LetterLanguage>(initialData?.language ?? "auto");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settingsSummary = `${TONE_SUMMARY[writingTone]} · ${STYLE_SUMMARY[languageStyle]} · ${LANGUAGE_SUMMARY[language]}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoadingFile(true);
    try {
      const uploaded = await fileToUploadedFile(file);
      setUploadedFiles([uploaded]);
      setError(null);
    } catch {
      setError("Failed to read file. Please try again.");
    } finally {
      setIsLoadingFile(false);
      e.target.value = "";
    }
  };

  const removeFile = () => setUploadedFiles([]);

  const handleSubmit = () => {
    if (!companyName.trim() || !position.trim()) {
      setError("Please fill in Company Name and Position.");
      return;
    }
    if (mode === "manual" && !jobDescription.trim()) {
      setError("Please provide a job description.");
      return;
    }
    if (mode === "upload" && uploadedFiles.length === 0) {
      setError("Please upload a job description file.");
      return;
    }
    setError(null);
    onSubmit({
      companyName: companyName.trim(),
      position: position.trim(),
      jobDescription: jobDescription.trim(),
      additionalNotes: additionalNotes.trim() || undefined,
      writingTone,
      languageStyle,
      language,
      uploadedFiles: mode === "upload" ? uploadedFiles : undefined,
    });
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
        <h1 className="text-[22px] font-bold text-foreground">Create Application Letter</h1>
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to provide the job details.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-4">
        {/* Manual Input */}
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all ${
            mode === "manual"
              ? "border-2 border-accent-coral bg-accent-coral-light"
              : "border border-border bg-card hover:border-accent-coral/50"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              mode === "manual" ? "bg-accent-coral" : "bg-muted"
            }`}
          >
            <Pencil size={20} className={mode === "manual" ? "text-white" : "text-muted-foreground"} />
          </div>
          <div className="text-center">
            <p className={`font-semibold text-base ${mode === "manual" ? "text-accent-coral" : "text-muted-foreground"}`}>
              Manual Input
            </p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Type or paste job details manually</p>
          </div>
        </button>

        {/* Upload File */}
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all ${
            mode === "upload"
              ? "border-2 border-accent-coral bg-accent-coral-light"
              : "border border-border bg-card hover:border-accent-coral/50"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              mode === "upload" ? "bg-accent-coral" : "bg-muted"
            }`}
          >
            <CloudUpload size={20} className={mode === "upload" ? "text-white" : "text-muted-foreground"} />
          </div>
          <div className="text-center">
            <p className={`font-semibold text-base ${mode === "upload" ? "text-accent-coral" : "text-muted-foreground"}`}>
              Upload File
            </p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Upload a job description document</p>
          </div>
        </button>
      </div>

      {/* Job Information Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-border">
          <p className="font-semibold text-[15px] text-foreground">Job Information</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Upload a file or paste job details and provide additional information
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Upload area */}
          {mode === "upload" && (
            uploadedFiles.length > 0 ? (
              <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded bg-accent-coral-light flex items-center justify-center shrink-0">
                    <CloudUpload size={14} className="text-accent-coral" />
                  </div>
                  <span className="text-sm text-foreground truncate">{uploadedFiles[0].name}</span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="ml-2 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 p-8 bg-card border border-border rounded-xl hover:border-accent-coral transition-colors"
                disabled={isLoadingFile}
              >
                <CloudUpload size={40} className="text-muted-foreground/60" />
                <div className="text-center space-y-0.5">
                  <p className="text-[15px] font-medium text-foreground">
                    {isLoadingFile ? "Reading file..." : "Click to upload a file"}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    Supports PDF, DOCX, TXT, PNG, JPG, WEBP
                  </p>
                </div>
                {/* AI feature pill */}
                <div className="flex items-center gap-2 bg-accent-coral-light rounded-md px-3.5 py-2">
                  <Sparkles size={14} className="text-accent-coral shrink-0" />
                  <span className="text-xs text-accent-coral text-center">
                    AI will extract job details from your uploaded file automatically
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoadingFile}
                />
              </button>
            )
          )}

          {/* Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
                placeholder="e.g. Google"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Position / Job Title</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
          </div>

          {mode === "manual" && (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none min-h-[150px] resize-none text-sm placeholder:text-muted-foreground/50 leading-relaxed"
                placeholder="Paste the job description here..."
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Additional Notes</label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
              placeholder="e.g. Available from April, salary expectation $XXk..."
            />
          </div>
        </div>
      </div>

      {/* Letter Settings (collapsible) */}
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between px-6 py-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles size={16} className="text-accent-coral shrink-0" />
                <span className="font-semibold text-sm text-foreground">Letter Settings</span>
                {!settingsOpen && (
                  <span className="text-xs text-muted-foreground truncate">{settingsSummary}</span>
                )}
              </div>
              {settingsOpen ? (
                <ChevronUp size={16} className="text-muted-foreground shrink-0 ml-2" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-2" />
              )}
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-6 pb-6 space-y-6 border-t border-border pt-5">
              {/* Writing Tone */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Mic size={16} className="text-muted-foreground" />
                  <p className="text-[13px] font-semibold text-foreground">Writing Tone</p>
                </div>
                <RadioCards options={TONE_OPTIONS} value={writingTone} onChange={setWritingTone} />
              </div>

              {/* Language Style */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <PenTool size={16} className="text-muted-foreground" />
                  <p className="text-[13px] font-semibold text-foreground">Language Style</p>
                </div>
                <RadioCards options={STYLE_OPTIONS} value={languageStyle} onChange={setLanguageStyle} />
              </div>

              {/* Language */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-muted-foreground" />
                  <p className="text-[13px] font-semibold text-foreground">Language</p>
                </div>
                <RadioCards options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoadingFile} className="gap-2">
          <Sparkles size={15} />
          Generate Letter
        </Button>
      </div>
    </div>
  );
}
