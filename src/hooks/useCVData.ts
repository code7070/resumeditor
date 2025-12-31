import { useState, useEffect, useCallback } from "react";
import type { CVData } from "../types";
import { initialCVData } from "../types";

export function useCVData() {
  const [data, setDataInternal] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem("cv-data");
      return saved ? JSON.parse(saved) : initialCVData;
    } catch (e) {
      console.error("Failed to load CV data from local storage", e);
      return initialCVData;
    }
  });

  const [history, setHistory] = useState<CVData[]>([]);
  const [future, setFuture] = useState<CVData[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem("cv-data", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save CV data to local storage", e);
    }
  }, [data]);

  const setData = useCallback((update: CVData | ((prev: CVData) => CVData)) => {
    setDataInternal((prev) => {
      const next = typeof update === "function" ? update(prev) : update;

      // Basic change detection to avoid redundant history states
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setHistory((prevHistory) => [...prevHistory.slice(-19), prev]); // Limit to 20 undo steps
        setFuture([]);
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;

    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const previousState = newHistory.pop();
      if (previousState) {
        setFuture((prevFuture) => [data, ...prevFuture]);
        setDataInternal(previousState);
      }
      return newHistory;
    });
  }, [data, history]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    setFuture((prevFuture) => {
      const newFuture = [...prevFuture];
      const nextState = newFuture.shift();
      if (nextState) {
        setHistory((prevHistory) => [...prevHistory, data]);
        setDataInternal(nextState);
      }
      return newFuture;
    });
  }, [data, future]);

  const save = useCallback(() => {
    const timestamp = new Date().toLocaleString();
    setData((prev) => ({ ...prev, lastSaved: timestamp }));
  }, [setData]);

  const updateHeader = (header: Partial<CVData["header"]>) => {
    setData((prev) => ({ ...prev, header: { ...prev.header, ...header } }));
  };

  const updateSummary = (summary: string) => {
    setData((prev) => ({ ...prev, summary }));
  };

  return {
    data,
    setData,
    updateHeader,
    updateSummary,
    undo,
    redo,
    save,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
  };
}
