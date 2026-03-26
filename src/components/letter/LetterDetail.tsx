import { useState } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Trash2,
  Edit3,
} from "lucide-react";
import { Button } from "../ui/button";
import type { ApplicationLetter } from "../../types";

interface LetterDetailProps {
  letter: ApplicationLetter;
  signerName: string;
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ApplicationLetter>) => void;
}

export function LetterDetail({
  letter,
  signerName,
  onBack,
  onDelete,
  onUpdate,
}: LetterDetailProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(letter.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(letter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullContent = `${new Date(letter.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}\n\n${letter.companyName}\n\nDear Hiring Manager,\n\n${letter.content}\n\nSincerely,\n${signerName}`;

    const blob = new Blob([fullContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `letter-${letter.companyName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    onUpdate(letter.id, { content: editContent });
    setIsEditing(false);
  };

  const date = new Date(letter.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-positive-bg text-positive-green",
    archived: "bg-muted text-muted-foreground",
  };

  const paragraphs = letter.content.split(/\n\n+/).filter(Boolean);

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
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Application Letter
            </h1>
            <p className="text-sm text-muted-foreground">{letter.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              if (isEditing) {
                handleSaveEdit();
              } else {
                setIsEditing(true);
              }
            }}
            title={isEditing ? "Save edits" : "Edit"}
          >
            {isEditing ? <Check size={16} /> : <Edit3 size={16} />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleCopy} title="Copy">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleDownload} title="Download">
            <Download size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete"
            className="hover:text-destructive"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent-coral-light text-accent-coral">
          {letter.companyName}
        </span>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
          {letter.position}
        </span>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
          {date}
        </span>
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${
            statusColors[letter.status]
          }`}
        >
          {letter.status}
        </span>
      </div>

      {/* Letter Card */}
      <div className="bg-card border border-border rounded-xl px-10 py-8 space-y-5">
        <p className="text-sm text-muted-foreground">{date}</p>

        <div className="text-sm text-foreground space-y-1">
          <p className="font-medium">{letter.companyName}</p>
          {letter.recipientAddress && (
            <p className="text-muted-foreground">{letter.recipientAddress}</p>
          )}
        </div>

        <p className="text-sm text-foreground">Dear Hiring Manager,</p>

        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[300px] px-0 py-2 bg-transparent text-sm text-foreground border-0 outline-none resize-none leading-relaxed focus:ring-0"
          />
        ) : (
          paragraphs.map((paragraph, idx) => (
            <p key={idx} className="text-sm text-foreground leading-relaxed">
              {paragraph}
            </p>
          ))
        )}

        <div className="pt-4 space-y-1">
          <p className="text-sm text-foreground">Sincerely,</p>
          <p className="text-sm font-medium text-foreground">{signerName}</p>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="bg-error-bg border border-error-red/20 rounded-xl p-5 flex items-center justify-between">
          <p className="text-sm text-error-red font-medium">
            Delete this letter permanently?
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(letter.id);
                onBack();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
