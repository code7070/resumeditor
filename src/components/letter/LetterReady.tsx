import { CheckCircle, Lightbulb, Eye } from "lucide-react";
import { Button } from "../ui/button";

interface LetterReadyProps {
  onViewLetter: () => void;
}

export function LetterReady({ onViewLetter }: LetterReadyProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-card border border-border rounded-2xl p-10 w-full max-w-[560px] space-y-7 shadow-sm">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-[72px] h-[72px] rounded-full bg-[var(--positive-bg)] flex items-center justify-center">
            <CheckCircle size={36} className="text-[var(--positive-green)]" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-[22px] font-bold text-foreground">Your Letter is Ready!</h2>
          <p className="text-sm text-muted-foreground max-w-[420px] mx-auto leading-relaxed">
            Your application letter has been generated successfully. Review it below and make any
            adjustments if needed.
          </p>
        </div>

        {/* Tip box */}
        <div className="rounded-xl bg-accent-coral-light px-4 py-3.5 flex gap-3">
          <Lightbulb size={18} className="text-accent-coral shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[13px] font-semibold text-foreground">Quick Tips</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You can edit the letter directly, copy it to clipboard, or export as PDF. Use the AI
              chat to refine specific sections.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Button onClick={onViewLetter} className="gap-2 px-8">
            <Eye size={16} />
            View Letter
          </Button>
        </div>
      </div>
    </div>
  );
}
