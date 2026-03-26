import { useState } from "react";
import { ArrowLeft, FileText, X } from "lucide-react";
import { Button } from "../ui/button";
import { LetterPickerModal } from "./LetterPickerModal";
import type {
  JobApplication,
  ApplicationStatus,
  ApplicationLetter,
} from "../../types";

interface TrackerFormProps {
  application?: JobApplication | null;
  letters: ApplicationLetter[];
  onBack: () => void;
  onSave: (
    data: Omit<JobApplication, "id" | "createdAt" | "updatedAt">
  ) => void;
  onDelete?: (id: string) => void;
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export function TrackerForm({
  application,
  letters,
  onBack,
  onSave,
  onDelete,
}: TrackerFormProps) {
  const [companyName, setCompanyName] = useState(application?.companyName || "");
  const [position, setPosition] = useState(application?.position || "");
  const [status, setStatus] = useState<ApplicationStatus>(
    application?.status || "applied"
  );
  const [appliedDate, setAppliedDate] = useState(
    application?.appliedDate || new Date().toISOString().split("T")[0]
  );
  const [jobUrl, setJobUrl] = useState(application?.jobUrl || "");
  const [letterId, setLetterId] = useState<string | undefined>(
    application?.letterId
  );
  const [notes, setNotes] = useState(application?.notes || "");
  const [showLetterPicker, setShowLetterPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedLetter = letterId
    ? letters.find((l) => l.id === letterId)
    : null;

  const handleSubmit = () => {
    if (!companyName.trim() || !position.trim()) return;
    onSave({
      companyName: companyName.trim(),
      position: position.trim(),
      status,
      appliedDate,
      jobUrl: jobUrl.trim() || undefined,
      letterId,
      notes: notes.trim() || undefined,
    });
  };

  const isEdit = !!application;

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
          {isEdit ? "Edit Application" : "Add New Application"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update the details of your job application"
            : "Fill in the details to track your job application"}
        </p>
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
              placeholder="e.g. Senior Engineer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
              Progress
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral outline-none transition-all"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
              Applied Date
            </label>
            <input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Application Link (optional)
          </label>
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
            placeholder="https://example.com/job-posting"
          />
        </div>

        {/* Application Letter */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Application Letter
          </label>
          {selectedLetter ? (
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/50 border border-border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-accent-coral" />
                <span className="text-sm text-foreground">
                  {selectedLetter.companyName} - {selectedLetter.position}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLetterPicker(true)}
                  className="text-xs text-accent-coral font-medium hover:underline"
                >
                  Change
                </button>
                <button
                  onClick={() => setLetterId(undefined)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowLetterPicker(true)}
              className="w-full justify-start text-muted-foreground"
            >
              <FileText size={16} />
              Choose Letter
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none min-h-[100px] resize-none text-sm placeholder:text-muted-foreground/50 leading-relaxed"
            placeholder="Any additional notes..."
          />
        </div>
      </div>

      {/* Delete confirmation */}
      {isEdit && showDeleteConfirm && (
        <div className="bg-error-bg border border-error-red/20 rounded-xl p-5 flex items-center justify-between">
          <p className="text-sm text-error-red font-medium">
            Delete this application permanently?
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
                onDelete?.(application!.id);
                onBack();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <div>
          {isEdit && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!companyName.trim() || !position.trim()}
          >
            {isEdit ? "Update Application" : "Save Application"}
          </Button>
        </div>
      </div>

      {/* Letter Picker Modal */}
      <LetterPickerModal
        isOpen={showLetterPicker}
        letters={letters}
        currentLetterId={letterId}
        onClose={() => setShowLetterPicker(false)}
        onSelect={(id) => {
          setLetterId(id);
          setShowLetterPicker(false);
        }}
      />
    </div>
  );
}
