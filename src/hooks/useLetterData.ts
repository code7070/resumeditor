import { useState, useEffect, useCallback } from "react";
import type { ApplicationLetter } from "../types";

const STORAGE_KEY = "application-letters";

function loadLetters(): ApplicationLetter[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLetters(letters: ApplicationLetter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
}

export function useLetterData() {
  const [letters, setLetters] = useState<ApplicationLetter[]>(loadLetters);

  useEffect(() => {
    saveLetters(letters);
  }, [letters]);

  const createLetter = useCallback(
    (
      letter: Omit<ApplicationLetter, "id" | "createdAt" | "updatedAt" | "status">
    ): ApplicationLetter => {
      const now = new Date().toISOString();
      const newLetter: ApplicationLetter = {
        ...letter,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        status: "draft",
      };
      setLetters((prev) => [newLetter, ...prev]);
      return newLetter;
    },
    []
  );

  const updateLetter = useCallback(
    (id: string, updates: Partial<ApplicationLetter>) => {
      setLetters((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, ...updates, updatedAt: new Date().toISOString() }
            : l
        )
      );
    },
    []
  );

  const deleteLetter = useCallback((id: string) => {
    setLetters((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const getLetter = useCallback(
    (id: string) => letters.find((l) => l.id === id) || null,
    [letters]
  );

  return {
    letters,
    createLetter,
    updateLetter,
    deleteLetter,
    getLetter,
  };
}
