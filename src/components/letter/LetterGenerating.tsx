import { Sparkles, Check, Loader2 } from "lucide-react";

const STEPS = [
  "Extracting your resume data",
  "Analyzing job requirements",
  "Crafting your application letter",
];

interface LetterGeneratingProps {
  currentStep: number;
  stepDescription: string;
}

export function LetterGenerating({ currentStep, stepDescription }: LetterGeneratingProps) {
  const progress = Math.round((currentStep / 3) * 100);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-card border border-border rounded-2xl p-12 w-full max-w-md space-y-8 shadow-sm">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-accent-coral-light flex items-center justify-center">
            <Sparkles size={28} className="text-accent-coral" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Generating Your Letter</h2>
          <p className="text-sm text-muted-foreground">{stepDescription}</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={stepNum} className="flex items-center gap-3">
                <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-[var(--positive-green)] flex items-center justify-center">
                      <Check size={13} className="text-white" strokeWidth={2.5} />
                    </div>
                  ) : isCurrent ? (
                    <Loader2 size={22} className="text-accent-coral animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    isCompleted
                      ? "text-muted-foreground line-through"
                      : isCurrent
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-coral rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">Step {currentStep} of 3</p>
        </div>
      </div>
    </div>
  );
}
