import { useState, useEffect } from "react";
import type { CVData } from "../types";
import { initialCVData } from "../types";

export function useCVData() {
  const [data, setData] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem("cv-data");
      return saved ? JSON.parse(saved) : initialCVData;
    } catch (e) {
      console.error("Failed to load CV data from local storage", e);
      return initialCVData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cv-data", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save CV data to local storage", e);
    }
  }, [data]);

  const updateHeader = (header: Partial<CVData["header"]>) => {
    setData((prev) => ({ ...prev, header: { ...prev.header, ...header } }));
  };

  const updateSummary = (summary: string) => {
    setData((prev) => ({ ...prev, summary }));
  };

  return { data, setData, updateHeader, updateSummary };
}
