import { CheckCircle2, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import type { ArtifactResponse } from "@/lib/parseAIResponse";

// interface ArtifactCardProps {
//   type: string;
//   content: string;
//   metadata?: { rationale?: string };
//   onInsert: () => void;
// }

// export function ArtifactCard({
//   type,
//   content,
//   metadata,
//   onInsert,
// }: Readonly<ArtifactCardProps>) {
//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(content);
//     // Optional: show toast notification
//   };

//   return (
//     <div className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50 my-3">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3">
//         <span className="text-sm font-semibold text-orange-700 uppercase">
//           ✨ Generated {type.replace("_", " ")}
//         </span>
//         <div className="flex gap-2">
//           <button
//             onClick={copyToClipboard}
//             className="px-3 py-1 text-sm border rounded hover:bg-white"
//           >
//             📋 Copy
//           </button>
//           <button
//             onClick={onInsert}
//             className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
//           >
//             ➕ Insert to CV
//           </button>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="bg-white rounded p-3 text-sm whitespace-pre-wrap border">
//         {content}
//       </div>

//       {/* Rationale */}
//       {metadata?.rationale && (
//         <div className="mt-2 text-xs text-gray-600 italic">
//           💡 {metadata.rationale}
//         </div>
//       )}
//     </div>
//   );
// }

// New Artifact Card Component
export default function ArtifactCard({
  artifact,
  onInsert,
}: {
  artifact: ArtifactResponse;
  onInsert: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-2 border-orange-500 rounded-xl p-4 bg-orange-50 dark:bg-orange-950/20 shadow-lg animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-orange-600" />
          <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
            Generated {artifact.artifact_type.replace("_", " ")}
          </span>
        </div>
        <div className="flex gap-2 justify-end flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-7 text-xs gap-1.5 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40"
          >
            {copied ? (
              <>
                <CheckCircle2 className="size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={onInsert}
            className="h-7 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 shadow-sm"
          >
            <CheckCircle2 className="size-3" />
            Insert to CV
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-sm border border-orange-100 dark:border-orange-900/50 whitespace-pre-wrap leading-relaxed">
        {typeof artifact.content === "string"
          ? artifact.content
          : JSON.stringify(artifact.content, null, 2)}
      </div>

      {/* Rationale */}
      {artifact.metadata?.rationale && (
        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800 text-xs text-gray-600 dark:text-gray-400 flex gap-2">
          <span className="shrink-0">💡</span>
          <p className="leading-relaxed">{artifact.metadata.rationale}</p>
        </div>
      )}
    </div>
  );
}
