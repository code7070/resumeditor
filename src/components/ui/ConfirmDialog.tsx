import { Dialog } from "./Dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
  readonly isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  isDestructive = true,
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6 py-2 px-6">
        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="shrink-0 p-2 bg-white rounded-full shadow-sm text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <p className="text-sm text-amber-900 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 text-xs font-bold text-white rounded-xl transition-all shadow-lg shadow-black/5 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-900 hover:bg-black"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
