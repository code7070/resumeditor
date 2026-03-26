import type { FontFamily, TypographySettings } from "../../types";

interface FontStyleFormProps {
  font: FontFamily;
  typography: TypographySettings;
  onFontChange: (font: FontFamily) => void;
  onTypographyChange: (typography: TypographySettings) => void;
}

const fontOptions: { key: FontFamily; label: string; family: string }[] = [
  { key: "outfit", label: "Outfit", family: '"Outfit", sans-serif' },
  { key: "inter", label: "Inter", family: '"Inter", sans-serif' },
  { key: "georgia", label: "Georgia", family: '"Georgia", serif' },
  { key: "playfair", label: "Playfair", family: '"Playfair Display", serif' },
  { key: "lato", label: "Lato", family: '"Lato", sans-serif' },
];

export function FontStyleForm({
  font,
  typography,
  onFontChange,
  onTypographyChange,
}: FontStyleFormProps) {
  const currentFamily =
    fontOptions.find((f) => f.key === font)?.family ?? "sans-serif";

  const updateField = (field: keyof TypographySettings, value: number) => {
    onTypographyChange({ ...typography, [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* FONT FAMILY */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[2px]">
          Font Family
        </label>
        <div className="flex gap-2.5">
          {fontOptions.map((opt) => {
            const isSelected = font === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => onFontChange(opt.key)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-accent-coral bg-accent-coral-light"
                    : "border-border-subtle bg-white dark:bg-card hover:bg-[#fafaf8] dark:hover:bg-muted hover:border-accent-coral/50"
                }`}
              >
                <span
                  className={`text-[22px] font-bold ${
                    isSelected
                      ? "text-accent-coral"
                      : "text-foreground"
                  }`}
                  style={{ fontFamily: opt.family }}
                >
                  Aa
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    isSelected
                      ? "text-accent-coral"
                      : "text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TYPOGRAPHY SETTINGS */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[2px]">
          Typography Settings
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Heading Size
            </label>
            <input
              type="number"
              min={10}
              max={28}
              step={1}
              value={typography.headingSize}
              onChange={(e) =>
                updateField("headingSize", Number(e.target.value))
              }
              className="w-full px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all text-sm"
              placeholder="14"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Body Size</label>
            <input
              type="number"
              min={8}
              max={18}
              step={1}
              value={typography.bodySize}
              onChange={(e) =>
                updateField("bodySize", Number(e.target.value))
              }
              className="w-full px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all text-sm"
              placeholder="11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Line Height
            </label>
            <input
              type="number"
              min={1.0}
              max={2.5}
              step={0.1}
              value={typography.lineHeight}
              onChange={(e) =>
                updateField("lineHeight", Number(e.target.value))
              }
              className="w-full px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all text-sm"
              placeholder="1.5"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Letter Spacing
            </label>
            <input
              type="number"
              min={0}
              max={3}
              step={0.1}
              value={typography.letterSpacing}
              onChange={(e) =>
                updateField("letterSpacing", Number(e.target.value))
              }
              className="w-full px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all text-sm"
              placeholder="0.5"
            />
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[2px]">
          Preview
        </label>
        <div
          className="bg-muted border border-border-subtle rounded-xl p-4 space-y-1.5"
          style={{
            fontFamily: currentFamily,
            lineHeight: typography.lineHeight,
            letterSpacing: `${typography.letterSpacing}px`,
          }}
        >
          <div
            className="font-bold text-foreground"
            style={{ fontSize: `${typography.headingSize}pt` }}
          >
            John Doe
          </div>
          <div
            className="text-muted-foreground"
            style={{ fontSize: `${typography.bodySize}pt` }}
          >
            Software Engineer
          </div>
          <div className="border-t border-border-subtle my-1.5" />
          <div
            className="font-semibold text-foreground uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "3px",
            }}
          >
            Experience
          </div>
          <div
            className="text-muted-foreground"
            style={{ fontSize: `${typography.bodySize}pt` }}
          >
            Senior Developer at Tech Corp &bull; 2020–Present
          </div>
        </div>
      </div>
    </div>
  );
}
