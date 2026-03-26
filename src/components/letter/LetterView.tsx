import { useState, useCallback } from "react";
import type { CVData } from "../../types";
import { useLetterData } from "../../hooks/useLetterData";
import { LetterList } from "./LetterList";
import { LetterForm, type LetterFormData } from "./LetterForm";
import { LetterResult } from "./LetterResult";
import { LetterDetail } from "./LetterDetail";
import { LetterGenerating } from "./LetterGenerating";
import { LetterReady } from "./LetterReady";
import { generateLetterWithProgress } from "../../services/gemini";

type LetterScreen =
  | { type: "list" }
  | { type: "form"; initialData?: Partial<LetterFormData> }
  | { type: "generating"; formData: LetterFormData }
  | { type: "info"; generatedContent: string; formData: LetterFormData }
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
  const { letters, createLetter, updateLetter, deleteLetter, getLetter } = useLetterData();
  const [screen, setScreen] = useState<LetterScreen>({ type: "list" });
  const [generatingStep, setGeneratingStep] = useState(1);
  const [stepDescription, setStepDescription] = useState("");

  const signerName = cvData.header.name || "Your Name";

  const runGeneration = useCallback(
    async (formData: LetterFormData) => {
      try {
        const content = await generateLetterWithProgress(
          {
            cvData,
            companyName: formData.companyName,
            position: formData.position,
            jobDescription: formData.jobDescription,
            additionalNotes: formData.additionalNotes,
            writingTone: formData.writingTone,
            languageStyle: formData.languageStyle,
            language: formData.language,
            uploadedFiles: formData.uploadedFiles,
          },
          (step, description) => {
            setGeneratingStep(step);
            setStepDescription(description);
          }
        );
        setScreen({ type: "info", generatedContent: content, formData });
      } catch {
        // Return to form with existing data pre-populated so user doesn't lose inputs
        setScreen({ type: "form", initialData: formData });
      }
    },
    [cvData]
  );

  if (screen.type === "form") {
    return (
      <LetterForm
        cvData={cvData}
        initialData={screen.initialData}
        onBack={() => setScreen({ type: "list" })}
        onSubmit={(formData) => {
          setGeneratingStep(1);
          setStepDescription("Extracting your resume data");
          setScreen({ type: "generating", formData });
          runGeneration(formData);
        }}
      />
    );
  }

  if (screen.type === "generating") {
    return <LetterGenerating currentStep={generatingStep} stepDescription={stepDescription} />;
  }

  if (screen.type === "info") {
    return (
      <LetterReady
        onViewLetter={() =>
          setScreen({
            type: "result",
            companyName: screen.formData.companyName,
            position: screen.formData.position,
            jobDescription: screen.formData.jobDescription,
            content: screen.generatedContent,
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
