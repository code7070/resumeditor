import { useState, useEffect, useCallback } from "react";
import type { JobApplication } from "../types";

const STORAGE_KEY = "job-applications";

function loadApplications(): JobApplication[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveApplications(apps: JobApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function useTrackerData() {
  const [applications, setApplications] =
    useState<JobApplication[]>(loadApplications);

  useEffect(() => {
    saveApplications(applications);
  }, [applications]);

  const createApplication = useCallback(
    (
      app: Omit<JobApplication, "id" | "createdAt" | "updatedAt">
    ): JobApplication => {
      const now = new Date().toISOString();
      const newApp: JobApplication = {
        ...app,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      setApplications((prev) => [newApp, ...prev]);
      return newApp;
    },
    []
  );

  const updateApplication = useCallback(
    (id: string, updates: Partial<JobApplication>) => {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, ...updates, updatedAt: new Date().toISOString() }
            : a
        )
      );
    },
    []
  );

  const deleteApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getApplication = useCallback(
    (id: string) => applications.find((a) => a.id === id) || null,
    [applications]
  );

  return {
    applications,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplication,
  };
}
