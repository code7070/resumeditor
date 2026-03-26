import { useState } from "react";
import { ArrowLeft, Copy, Check, Save } from "lucide-react";
import { Button } from "../ui/button";

interface LetterResultProps {
  companyName: string;
  position: string;
  content: string;
  signerName: string;
  onBack: () => void;
  onSave: () => void;
}

export function LetterResult({
  companyName,
  position,
  content,
  signerName,
  onBack,
  onSave,
}: LetterResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const paragraphs = content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto w-full p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">
            Generated Application Letter
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" onClick={onSave}>
            <Save size={14} />
            Save
          </Button>
        </div>
      </div>

      {/* Metadata badges */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent-coral-light text-accent-coral">
          {companyName}
        </span>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
          {position}
        </span>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
          {today}
        </span>
      </div>

      {/* Letter Card */}
      <div className="bg-card border border-border rounded-xl px-10 py-8 space-y-5">
        <p className="text-sm text-muted-foreground">{today}</p>

        <div className="text-sm text-foreground space-y-1">
          <p className="font-medium">{companyName}</p>
        </div>

        <p className="text-sm text-foreground">Dear Hiring Manager,</p>

        {paragraphs.map((paragraph, idx) => (
          <p key={idx} className="text-sm text-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div className="pt-4 space-y-1">
          <p className="text-sm text-foreground">Sincerely,</p>
          <p className="text-sm font-medium text-foreground">{signerName}</p>
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground/60 text-center">
        This letter was generated based on your resume and the provided job
        description. Review and edit as needed before sending.
      </p>
    </div>
  );
}
