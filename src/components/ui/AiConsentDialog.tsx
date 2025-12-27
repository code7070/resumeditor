import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import { DialogApp } from "./DialogApp";

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
}: // isDestructive = false,
Readonly<AiConsentDialogProps>) {
  const [acceptedItems, setAcceptedItems] = useState<Record<string, boolean>>(
    {}
  );

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAcceptedItems({});
    }
  }, [isOpen]);

  const allAccepted =
    consentItems.length > 0 &&
    consentItems.every((item) => acceptedItems[item.id]);

  const Icon: LucideIcon = icon === "shield" ? ShieldCheck : Sparkles;
  const iconColorClass =
    icon === "shield" ? "text-blue-600" : "text-emerald-600";
  const iconBgClass = icon === "shield" ? "bg-blue-50" : "bg-emerald-50";
  const confirmBtnClass =
    icon === "shield"
      ? "bg-gray-900 hover:bg-black checkbox-blue"
      : "bg-emerald-600 hover:bg-emerald-700 checkbox-emerald";

  return (
    <DialogApp isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6 py-4">
        {/* Header Section */}
        <div
          className={`${iconBgClass} p-6 rounded-2xl border border-transparent flex flex-col items-center text-center`}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Icon size={24} className={iconColorClass} />
          </div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <div className="text-xs text-gray-600 mt-2 leading-relaxed max-w-[90%]">
            {description}
          </div>
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-3">
          {consentItems.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 group"
            >
              <input
                type="checkbox"
                className={`w-4 h-4 rounded border-gray-300 focus:ring-offset-0 focus:ring-0 cursor-pointer ${
                  icon === "shield"
                    ? "text-blue-600 focus:ring-blue-500 checked:bg-blue-600"
                    : "text-emerald-600 focus:ring-emerald-500 checked:bg-emerald-600"
                }`}
                checked={!!acceptedItems[item.id]}
                onChange={(e) =>
                  setAcceptedItems((prev) => ({
                    ...prev,
                    [item.id]: e.target.checked,
                  }))
                }
              />
              <span className="text-xs text-gray-700 leading-tight group-hover:text-gray-900 transition-colors select-none">
                {item.label}
              </span>
            </label>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-400 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!allAccepted}
            onClick={onConfirm}
            className={`flex-1 py-3 text-white rounded text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </DialogApp>
  );
}
