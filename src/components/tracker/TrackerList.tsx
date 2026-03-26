import { Plus, Briefcase, FileText } from "lucide-react";
import { Button } from "../ui/button";
import type { JobApplication, ApplicationStatus, ApplicationLetter } from "../../types";

interface TrackerListProps {
  applications: JobApplication[];
  letters: ApplicationLetter[];
  onAddNew: () => void;
  onEdit: (id: string) => void;
}

const STATUS_BADGE: Record<
  ApplicationStatus,
  { bg: string; text: string; label: string }
> = {
  applied: { bg: "bg-accent-coral-light", text: "text-accent-coral", label: "Applied" },
  screening: { bg: "bg-warning-bg", text: "text-warning-yellow", label: "Screening" },
  interview: { bg: "bg-accent-coral-light", text: "text-accent-coral", label: "Interview" },
  offer: { bg: "bg-positive-bg", text: "text-positive-green", label: "Offer" },
  rejected: { bg: "bg-error-bg", text: "text-error-red", label: "Rejected" },
  withdrawn: { bg: "bg-muted", text: "text-muted-foreground", label: "Withdrawn" },
};

export function TrackerList({
  applications,
  letters,
  onAddNew,
  onEdit,
}: TrackerListProps) {
  if (applications.length === 0) {
    return (
      <div className="max-w-3xl mx-auto w-full p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent-coral-light flex items-center justify-center">
            <Briefcase size={28} className="text-accent-coral" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No Applications Yet
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Start tracking your job applications. Add your first application to
            get started.
          </p>
          <Button onClick={onAddNew} className="mt-2">
            <Plus size={16} />
            Add Application
          </Button>
        </div>
      </div>
    );
  }

  const getLetterName = (letterId?: string) => {
    if (!letterId) return null;
    const letter = letters.find((l) => l.id === letterId);
    return letter ? `${letter.companyName} - ${letter.position}` : null;
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">
            Application Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <Button onClick={onAddNew}>
          <Plus size={16} />
          Add Application
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1fr_130px_120px_1fr] bg-muted px-5 py-3 text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Company</span>
          <span>Position</span>
          <span>Status</span>
          <span>Applied</span>
          <span>Letter</span>
        </div>

        {/* Rows */}
        {applications.map((app) => {
          const badge = STATUS_BADGE[app.status];
          const letterName = getLetterName(app.letterId);
          const date = new Date(app.appliedDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <button
              key={app.id}
              onClick={() => onEdit(app.id)}
              className="w-full grid grid-cols-[1fr_1fr_130px_120px_1fr] px-5 py-3.5 border-t border-border text-left hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground truncate pr-4">
                {app.companyName}
              </span>
              <span className="text-sm text-foreground truncate pr-4">
                {app.position}
              </span>
              <span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}
                >
                  {badge.label}
                </span>
              </span>
              <span className="text-sm text-muted-foreground">{date}</span>
              <span className="text-sm truncate">
                {letterName ? (
                  <span className="flex items-center gap-1.5 text-accent-coral">
                    <FileText size={14} />
                    <span className="truncate">{letterName}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
