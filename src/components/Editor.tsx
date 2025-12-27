import React from "react";
import type { CVData } from "../types";

interface EditorProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
  confirmDelete: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void;
}

export function Editor({
  data: _data,
  setData: _setData,
  confirmDelete: _confirmDelete,
}: EditorProps) {
  return (
    <div className="bg-white dark:bg-gray-900 h-full p-6 space-y-8">
      <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
        <p>
          Built with lazy from{" "}
          <a
            href="https://underline.id"
            className="text-orange-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Underline
          </a>
        </p>
      </div>
    </div>
  );
}
