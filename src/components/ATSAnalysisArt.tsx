import { useRef, useCallback, useLayoutEffect } from "react";
import p5 from "p5";
import { type ATSAnalysisResult } from "../services/gemini";
import {
  Check,
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Activity,
  Zap,
} from "lucide-react";

interface ATSAnalysisArtProps {
  readonly result: ATSAnalysisResult;
  readonly timestamp: number;
  readonly onBack?: () => void;
}

// --- Sub-components ---

function ScoreCard({
  value,
  label,
  status,
}: {
  value: number | string;
  label: string;
  status: "good" | "warning" | "error";
}) {
  const badgeMap = {
    good: {
      bg: "bg-positive-bg",
      text: "text-positive-green",
      label: "Good",
    },
    warning: {
      bg: "bg-warning-bg",
      text: "text-warning-yellow",
      label: "Needs Work",
    },
    error: {
      bg: "bg-error-bg",
      text: "text-error-red",
      label: "Poor",
    },
  };
  const badge = badgeMap[status];

  return (
    <div className="flex-1 bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-2">
      <span className="text-4xl font-bold text-foreground">{value}</span>
      <span className="text-[13px] font-medium text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    </div>
  );
}

function ProgressBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <span className="text-[13px] font-semibold text-accent-coral">
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-coral rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function StatusIndicator({
  text,
  type,
}: {
  text: string;
  type: "pass" | "warning" | "error";
}) {
  const config = {
    pass: {
      bg: "bg-positive-bg",
      text: "text-positive-green",
      icon: Check,
    },
    warning: {
      bg: "bg-warning-bg",
      text: "text-warning-yellow",
      icon: AlertTriangle,
    },
    error: {
      bg: "bg-error-bg",
      text: "text-error-red",
      icon: AlertCircle,
    },
  };
  const { bg, text: textColor, icon: Icon } = config[type];

  return (
    <div
      className={`flex items-start gap-2.5 py-1.5 px-3 rounded-lg ${bg}`}
    >
      <Icon size={16} className={`${textColor} mt-0.5 shrink-0`} />
      <span className={`text-[13px] font-medium ${textColor}`}>{text}</span>
    </div>
  );
}

// --- Main Component ---

export function ATSAnalysisArt({
  result,
  timestamp,
  onBack,
}: ATSAnalysisArtProps) {
  const signalRef = useRef<HTMLDivElement>(null);
  const spectralRef = useRef<HTMLDivElement>(null);
  const p5Signal = useRef<p5 | null>(null);
  const p5Spectral = useRef<p5 | null>(null);

  const getScoreStatus = (score: number): "good" | "warning" | "error" => {
    if (score >= 80) return "good";
    if (score >= 60) return "warning";
    return "error";
  };

  const generateCanvases = useCallback(() => {
    const signalContainer = signalRef.current;
    const spectralContainer = spectralRef.current;
    if (!signalContainer || !spectralContainer) return;

    if (p5Signal.current) {
      p5Signal.current.remove();
      p5Signal.current = null;
    }
    if (p5Spectral.current) {
      p5Spectral.current.remove();
      p5Spectral.current = null;
    }

    signalContainer.innerHTML = "";
    spectralContainer.innerHTML = "";

    const signalSketch = (p: p5) => {
      let particles: any[] = [];
      const score = result.score;

      p.setup = () => {
        p.createCanvas(signalContainer.offsetWidth || 260, 180);
        const count = 60;
        for (let i = 0; i < count; i++) {
          particles.push({
            angle: p.random(p.TWO_PI),
            radius: p.random(30, 60),
            speed: p.map(score, 0, 100, 0.04, 0.01),
            offset: p.random(100),
            color: getColor(p, score),
          });
        }
      };

      p.draw = () => {
        p.clear(0, 0, 0, 0);
        p.translate(p.width / 2, p.height / 2);
        const entropy = p.map(score, 0, 100, 6, 0.3);
        const stability = p.map(score, 0, 100, 0.1, 1.2);

        p.noFill();
        p.strokeWeight(1.5);
        particles.forEach((pt) => {
          const noiseVal = p.noise(pt.offset + p.frameCount * 0.015);
          const r =
            pt.radius + p.map(noiseVal, 0, 1, -25 * entropy, 25 * entropy);
          p.stroke(pt.color);
          p.point(p.cos(pt.angle) * r, p.sin(pt.angle) * r);
          pt.angle += pt.speed * stability;
          pt.offset += 0.01;
        });

        const pulse = p.sin(p.frameCount * 0.06) * 3;
        p.stroke(getColor(p, score));
        p.ellipse(0, 0, 28 + pulse, 28 + pulse);

        p.textAlign(p.CENTER, p.CENTER);
        p.noStroke();
        p.fill(100);
        p.textSize(12);
        p.textStyle(p.BOLD);
        p.text(Math.round(score), 0, 0);
      };

      const getColor = (p: p5, s: number) => {
        if (s >= 80) return p.color(46, 125, 50, 130);
        if (s >= 60) return p.color(232, 90, 79, 130);
        return p.color(220, 38, 38, 130);
      };
    };

    const spectralSketch = (p: p5) => {
      const score = result.score;
      const bars = 16;

      p.setup = () => {
        p.createCanvas(spectralContainer.offsetWidth || 260, 180);
      };

      p.draw = () => {
        p.clear(0, 0, 0, 0);
        const margin = 20;
        const w = (p.width - margin * 2) / bars;

        p.noStroke();
        for (let i = 0; i < bars; i++) {
          const hNoise = p.noise(i * 0.2, p.frameCount * 0.05);
          const maxH = p.map(score, 0, 100, 40, 120);
          const h = p.map(hNoise, 0, 1, 8, maxH);
          const alpha = p.map(i, 0, bars, 60, 200);

          if (score >= 80) p.fill(46, 125, 50, alpha);
          else if (score >= 60) p.fill(232, 90, 79, alpha);
          else p.fill(220, 38, 38, alpha);

          p.rect(margin + i * w, p.height - h - 30, w - 2, h, 3);
        }

        p.fill(180);
        p.rect(margin, p.height - 25, p.width - margin * 2, 1, 1);
      };
    };

    p5Signal.current = new p5(signalSketch, signalContainer);
    p5Spectral.current = new p5(spectralSketch, spectralContainer);
  }, [result.score]);

  useLayoutEffect(() => {
    generateCanvases();
    return () => {
      if (p5Signal.current) {
        p5Signal.current.remove();
        p5Signal.current = null;
      }
      if (p5Spectral.current) {
        p5Spectral.current.remove();
        p5Spectral.current = null;
      }
    };
  }, [generateCanvases]);

  const dateStr = new Date(timestamp).toLocaleString();

  // Derive keyword density from score and data
  const keywordScore = Math.min(100, Math.max(0, result.score + (result.missingKeywords.length > 3 ? -15 : 5)));
  const formatScore = Math.min(100, Math.max(0, result.score + (result.formattingFeedback.length > 3 ? -10 : 10)));

  return (
    <div className="flex flex-col h-full w-full">
      {/* Sub-header with back + timestamp */}
      {onBack && (
        <div className="flex items-center gap-3 pb-4">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            {dateStr}
          </div>
        </div>
      )}

      {/* Score Cards Row */}
      <div className="flex gap-4 mb-6">
        <ScoreCard
          value={Math.round(result.score)}
          label="Overall ATS Score"
          status={getScoreStatus(result.score)}
        />
        <ScoreCard
          value={Math.round(keywordScore)}
          label="Keyword Match"
          status={getScoreStatus(keywordScore)}
        />
        <ScoreCard
          value={Math.round(formatScore)}
          label="Format Score"
          status={getScoreStatus(formatScore)}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-3 flex flex-col items-center">
          <div ref={signalRef} className="w-full flex justify-center" />
          <div className="flex items-center gap-2 mt-1">
            <Activity size={12} className="text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Narrative Signal
            </span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 flex flex-col items-center">
          <div ref={spectralRef} className="w-full flex justify-center" />
          <div className="flex items-center gap-2 mt-1">
            <Zap size={12} className="text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Spectral Density
            </span>
          </div>
        </div>
      </div>

      {/* Constructive Patterns */}
      {result.strengths.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-positive-green rounded-full" />
            <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
              Constructive Patterns
            </h3>
          </div>
          <div className="space-y-1.5">
            {result.strengths.map((str) => (
              <StatusIndicator key={str} text={str} type="pass" />
            ))}
          </div>
        </div>
      )}

      {/* Keyword Density */}
      {result.missingKeywords.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-accent-coral rounded-full" />
            <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
              Keyword Density
            </h3>
          </div>
          <div className="space-y-3">
            {result.missingKeywords.slice(0, 5).map((keyword, idx) => (
              <ProgressBar
                key={keyword}
                label={keyword}
                value={Math.max(5, 80 - idx * 18)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Interference Points */}
      {(result.improvements.length > 0 || result.formattingFeedback.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-error-red rounded-full" />
            <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
              Interference Points
            </h3>
          </div>
          <div className="space-y-1.5">
            {result.improvements.map((imp) => (
              <StatusIndicator key={imp} text={imp} type="warning" />
            ))}
            {result.formattingFeedback.map((f) => (
              <StatusIndicator key={f} text={f} type="error" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
