import React from "react";
import type { CVData } from "../../types";
import { ImportAction } from "./actions/ImportAction";
import { ExportAction } from "./actions/ExportAction";
import { ScannerAction } from "./actions/ScannerAction";

interface EditorActionsProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export function EditorActions({ data, setData }: EditorActionsProps) {
  return (
    <div className="flex gap-2">
      <ImportAction setData={setData} />
      <ExportAction data={data} />
      <ScannerAction data={data} />
    </div>
  );
}
