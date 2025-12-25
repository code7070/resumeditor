import { useRef, useCallback, useLayoutEffect } from "react";
import p5 from "p5";
import { type ATSAnalysisResult } from "../services/gemini";
import {
  Check,
  AlertCircle,
  Bug,
  ListRestart,
  TrendingUp,
  TrendingDown,
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

const ATS_COLORS = {
  dark: "#141413",
  light: "#faf9f5",
  midGray: "#b0aea5",
  lightGray: "#e8e6dc",
  orange: "#d97757",
  blue: "#6a9bcc",
  green: "#788c5d",
};

export function ATSAnalysisArt({
  result,
  timestamp,
  onBack,
}: ATSAnalysisArtProps) {
  const signalRef = useRef<HTMLDivElement>(null);
  const spectralRef = useRef<HTMLDivElement>(null);
  const p5Signal = useRef<p5 | null>(null);
  const p5Spectral = useRef<p5 | null>(null);

  const generateCanvases = useCallback(() => {
    const signalContainer = signalRef.current;
    const spectralContainer = spectralRef.current;
    if (!signalContainer || !spectralContainer) return;

    // Clean up existing instances if any
    if (p5Signal.current) {
      p5Signal.current.remove();
      p5Signal.current = null;
    }
    if (p5Spectral.current) {
      p5Spectral.current.remove();
      p5Spectral.current = null;
    }

    // Clear containers
    signalContainer.innerHTML = "";
    spectralContainer.innerHTML = "";

    // SIGNAL RESONANCE SKETCH
    const signalSketch = (p: p5) => {
      let particles: any[] = [];
      const score = result.score;

      p.setup = () => {
        p.createCanvas(signalContainer.offsetWidth || 300, 250);
        const count = 80;
        for (let i = 0; i < count; i++) {
          particles.push({
            angle: p.random(p.TWO_PI),
            radius: p.random(40, 80),
            speed: p.map(score, 0, 100, 0.04, 0.01),
            offset: p.random(100),
            color: getResonanceColor(p, score),
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

        const pulse = p.sin(p.frameCount * 0.06) * 4;
        p.stroke(getResonanceColor(p, score));
        p.ellipse(0, 0, 35 + pulse, 35 + pulse);

        p.textAlign(p.CENTER, p.CENTER);
        p.noStroke();
        p.fill(ATS_COLORS.dark);
        p.textSize(14);
        p.textStyle(p.BOLD);
        p.text(Math.round(score), 0, 0);
      };

      const getResonanceColor = (p: p5, s: number) => {
        if (s >= 80) return p.color(120, 140, 93, 130);
        if (s >= 50) return p.color(106, 155, 204, 130);
        return p.color(217, 119, 87, 130);
      };
    };

    // SPECTRAL DENSITY SKETCH
    const spectralSketch = (p: p5) => {
      const score = result.score;
      const bars = 20;

      p.setup = () => {
        p.createCanvas(spectralContainer.offsetWidth || 300, 250);
      };

      p.draw = () => {
        p.clear(0, 0, 0, 0);
        const margin = 30;
        const w = (p.width - margin * 2) / bars;

        p.noStroke();
        for (let i = 0; i < bars; i++) {
          const hNoise = p.noise(i * 0.2, p.frameCount * 0.05);
          const maxH = p.map(score, 0, 100, 50, 150);
          const h = p.map(hNoise, 0, 1, 10, maxH);

          const alpha = p.map(i, 0, bars, 50, 200);
          if (score >= 80) p.fill(120, 140, 93, alpha);
          else if (score >= 50) p.fill(106, 155, 204, alpha);
          else p.fill(217, 119, 87, alpha);

          p.rect(margin + i * w, p.height - h - 40, w - 2, h, 4);
        }

        p.fill(ATS_COLORS.midGray);
        p.rect(margin, p.height - 35, p.width - margin * 2, 2, 1);
      };
    };

    // Create instances
    p5Signal.current = new p5(signalSketch, signalContainer);
    p5Spectral.current = new p5(spectralSketch, spectralContainer);
  }, [result.score]);

  // Use useLayoutEffect to generate canvases after DOM is ready but before paint
  useLayoutEffect(() => {
    generateCanvases();

    // Cleanup on unmount
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

  return (
    <div className="flex flex-col h-full bg-[#faf9f5] w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e8e6dc] bg-white">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-sm font-bold text-[#141413]">
              Signal Artifact v2.0
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-[#b0aea5]">
              <Clock size={10} />
              {dateStr}
            </div>
          </div>
        </div>
        <div className="px-3 py-1 bg-[#141413] text-white text-[10px] font-black rounded-full tracking-wider uppercase">
          {result.score >= 80
            ? "Harmonic"
            : result.score >= 50
            ? "Stable"
            : "Unstable"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Dual Canvas Hero */}
        <div className="p-6 bg-linear-to-b from-white to-[#faf9f5]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-2xl border border-[#e8e6dc] p-4 flex flex-col items-center">
              <div ref={signalRef} className="w-full flex justify-center" />
              <div className="flex items-center gap-2 mt-2">
                <Activity size={12} className="text-[#b0aea5]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#141413]">
                  Narrative Signal
                </span>
              </div>
            </div>
            <div className="bg-white/50 rounded-2xl border border-[#e8e6dc] p-4 flex flex-col items-center">
              <div ref={spectralRef} className="w-full flex justify-center" />
              <div className="flex items-center gap-2 mt-2">
                <Zap size={12} className="text-[#b0aea5]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#141413]">
                  Spectral Density
                </span>
              </div>
            </div>
          </div>

          {/* Legend Area */}
          <div className="mt-6 bg-[#141413] text-white p-4 rounded-xl shadow-lg border border-black">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b0aea5] mb-2">
                  Signal Purity
                </h4>
                <p className="text-[10px] leading-relaxed text-gray-300">
                  Represents the cohesion of your professional narrative. Stable
                  orbital patterns indicate high signal clarity and minimal
                  formatting "noise".
                </p>
              </div>
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b0aea5] mb-2">
                  Keyword Density
                </h4>
                <p className="text-[10px] leading-relaxed text-gray-300">
                  Visualizes the frequency and relevance of key industry terms.
                  Taller vertical spectral bars correlate to stronger semantic
                  alignment with ATS rules.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Sections */}
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#788c5d]">
                <TrendingUp size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Constructive Patterns
                </h3>
              </div>
              <ul className="space-y-2">
                {result.strengths.map((str) => (
                  <li
                    key={str}
                    className="flex gap-3 text-[12px] leading-relaxed text-[#141413] bg-white p-3 rounded-xl border border-[#e8e6dc] shadow-sm"
                  >
                    <Check
                      size={14}
                      className="text-[#788c5d] mt-0.5 shrink-0"
                    />
                    {str}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#d97757]">
                <TrendingDown size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Interference Points
                </h3>
              </div>
              <ul className="space-y-2">
                {result.improvements.map((imp) => (
                  <li
                    key={imp}
                    className="flex gap-3 text-[12px] leading-relaxed text-[#141413] bg-white p-3 rounded-xl border border-[#e8e6dc] shadow-sm"
                  >
                    <AlertCircle
                      size={14}
                      className="text-[#d97757] mt-0.5 shrink-0"
                    />
                    {imp}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <hr className="border-[#e8e6dc]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6a9bcc]">
                <Bug size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Structural Integrity
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.formattingFeedback.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] font-medium px-2.5 py-1.5 bg-white border border-[#e8e6dc] text-[#141413] rounded-lg shadow-sm"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#b0aea5]">
                <ListRestart size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Missing Frequencies
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((k) => (
                  <span
                    key={k}
                    className="text-[10px] font-bold px-2.5 py-1.5 bg-[#141413] text-white rounded-lg"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
