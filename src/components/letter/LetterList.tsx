import { useState, useMemo } from "react";
import { Plus, Search, FileText, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import type { ApplicationLetter } from "../../types";

interface LetterListProps {
  letters: ApplicationLetter[];
  onCreateNew: () => void;
  onSelectLetter: (id: string) => void;
}

export function LetterList({
  letters,
  onCreateNew,
  onSelectLetter,
}: LetterListProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    let result = letters;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.companyName.toLowerCase().includes(q) ||
          l.position.toLowerCase().includes(q) ||
          l.content.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [letters, search, sortBy]);

  if (letters.length === 0) {
    return (
      <div className="max-w-2xl mx-auto w-full p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent-coral-light flex items-center justify-center">
            <FileText size={28} className="text-accent-coral" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No Application Letters Yet
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Create your first AI-generated application letter based on your resume
            and a job description.
          </p>
          <Button onClick={onCreateNew} className="mt-2">
            <Plus size={16} />
            Create New Letter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">
            My Application Letters
          </h1>
          <p className="text-sm text-muted-foreground">
            {letters.length} letter{letters.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus size={16} />
          Create New
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
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
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
          className="px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg text-sm outline-none focus:border-accent-coral"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Letter Cards */}
      <div className="space-y-3">
        {filtered.map((letter) => {
          const date = new Date(letter.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const preview =
            letter.content.slice(0, 120).replace(/\n/g, " ") + "...";

          const statusColors: Record<string, string> = {
            draft: "bg-muted text-muted-foreground",
            sent: "bg-positive-bg text-positive-green",
            archived: "bg-muted text-muted-foreground",
          };

          return (
            <button
              key={letter.id}
              onClick={() => onSelectLetter(letter.id)}
              className="w-full bg-card border border-border rounded-xl p-5 text-left hover:border-accent-coral/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {letter.companyName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {letter.position}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{date}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        statusColors[letter.status]
                      }`}
                    >
                      {letter.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground truncate">
                    {preview}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-muted-foreground/30 group-hover:text-foreground transition-colors mt-1 shrink-0"
                />
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">
            No letters match your search.
          </p>
        )}
      </div>
    </div>
  );
}
