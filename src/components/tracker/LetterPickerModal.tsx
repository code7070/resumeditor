import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Button } from "../ui/button";
import type { ApplicationLetter } from "../../types";

interface LetterPickerModalProps {
  isOpen: boolean;
  letters: ApplicationLetter[];
  currentLetterId?: string;
  onClose: () => void;
  onSelect: (letterId: string) => void;
}

export function LetterPickerModal({
  isOpen,
  letters,
  currentLetterId,
  onClose,
  onSelect,
}: LetterPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    currentLetterId || null
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return letters;
    const q = search.toLowerCase();
    return letters.filter(
      (l) =>
        l.companyName.toLowerCase().includes(q) ||
        l.position.toLowerCase().includes(q)
    );
  }, [letters, search]);

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Application Letter</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none text-sm placeholder:text-muted-foreground/50"
              placeholder="Search letters..."
            />
          </div>

          <p className="text-[13px] text-muted-foreground">
            Select an existing application letter from your saved letters
          </p>

          {/* Letter list */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">
                {letters.length === 0
                  ? "No saved letters yet. Create one first."
                  : "No letters match your search."}
              </p>
            ) : (
              filtered.map((letter) => {
                const isSelected = selectedId === letter.id;
                const date = new Date(letter.createdAt).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                );

                return (
                  <button
                    key={letter.id}
                    onClick={() => setSelectedId(letter.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-accent-coral bg-accent-coral-light"
                        : "border-border bg-card hover:border-accent-coral/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {letter.companyName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {letter.position}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {date}
                      </p>
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-accent-coral shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId}>
            <Check size={14} />
            Select Letter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
