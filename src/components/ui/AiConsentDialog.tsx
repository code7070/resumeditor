import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import { Button } from "./button";

export interface AiConsentItem {
  id: string;
  label: string;
}

interface AiConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: React.ReactNode;
  consentItems: AiConsentItem[];
  confirmLabel?: string;
  icon?: "sparkles" | "shield";
  isDestructive?: boolean;
}

export function AiConsentDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "AI Processing Consent",
  description,
  consentItems,
  confirmLabel = "Proceed",
  icon = "sparkles",
}: Readonly<AiConsentDialogProps>) {
  const [acceptedItems, setAcceptedItems] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (isOpen) {
      setAcceptedItems({});
    }
  }, [isOpen]);

  const allAccepted =
    consentItems.length > 0 &&
    consentItems.every((item) => acceptedItems[item.id]);

  const Icon: LucideIcon = icon === "shield" ? ShieldCheck : Sparkles;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 space-y-5">
          {/* Icon + Description */}
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-12 h-12 rounded-full bg-accent-coral-light flex items-center justify-center">
              <Icon size={24} className="text-accent-coral" />
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed max-w-[90%]">
              {description}
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-2">
            {consentItems.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 py-2.5 px-0 cursor-pointer group"
              >
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-border text-accent-coral focus:ring-accent-coral focus:ring-offset-0 cursor-pointer"
                    checked={!!acceptedItems[item.id]}
                    onChange={(e) =>
                      setAcceptedItems((prev) => ({
                        ...prev,
                        [item.id]: e.target.checked,
                      }))
                    }
                  />
                </div>
                <span className="text-[13px] text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors select-none">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!allAccepted} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
