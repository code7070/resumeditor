import { useState } from "react";
import type { CVData } from "../../types";
import { useLetterData } from "../../hooks/useLetterData";
import { LetterList } from "./LetterList";
import { LetterForm } from "./LetterForm";
import { LetterResult } from "./LetterResult";
import { LetterDetail } from "./LetterDetail";

type LetterScreen =
  | { type: "list" }
  | { type: "form" }
  | {
      type: "result";
      companyName: string;
      position: string;
      jobDescription: string;
      content: string;
    }
  | { type: "detail"; id: string };

interface LetterViewProps {
  cvData: CVData;
}

export function LetterView({ cvData }: LetterViewProps) {
  const { letters, createLetter, updateLetter, deleteLetter, getLetter } =
    useLetterData();
  const [screen, setScreen] = useState<LetterScreen>({ type: "list" });

  const signerName = cvData.header.name || "Your Name";

  if (screen.type === "form") {
    return (
      <LetterForm
        cvData={cvData}
        onBack={() => setScreen({ type: "list" })}
        onGenerated={(data) =>
          setScreen({
            type: "result",
            ...data,
          })
        }
      />
    );
  }

  if (screen.type === "result") {
    return (
      <LetterResult
        companyName={screen.companyName}
        position={screen.position}
        content={screen.content}
        signerName={signerName}
        onBack={() => setScreen({ type: "form" })}
        onSave={() => {
          const saved = createLetter({
            companyName: screen.companyName,
            position: screen.position,
            jobDescription: screen.jobDescription,
            content: screen.content,
          });
          setScreen({ type: "detail", id: saved.id });
        }}
      />
    );
  }

  if (screen.type === "detail") {
    const letter = getLetter(screen.id);
    if (!letter) {
      setScreen({ type: "list" });
      return null;
    }
    return (
      <LetterDetail
        letter={letter}
        signerName={signerName}
        onBack={() => setScreen({ type: "list" })}
        onDelete={(id) => {
          deleteLetter(id);
          setScreen({ type: "list" });
        }}
        onUpdate={updateLetter}
      />
    );
  }

  // Default: list
  return (
    <LetterList
      letters={letters}
      onCreateNew={() => setScreen({ type: "form" })}
      onSelectLetter={(id) => setScreen({ type: "detail", id })}
    />
  );
}
