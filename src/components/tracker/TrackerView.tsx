import { useState } from "react";
import { useTrackerData } from "../../hooks/useTrackerData";
import { useLetterData } from "../../hooks/useLetterData";
import { TrackerList } from "./TrackerList";
import { TrackerForm } from "./TrackerForm";

type TrackerScreen =
  | { type: "list" }
  | { type: "form"; editId?: string };

export function TrackerView() {
  const {
    applications,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplication,
  } = useTrackerData();
  const { letters } = useLetterData();
  const [screen, setScreen] = useState<TrackerScreen>({ type: "list" });

  if (screen.type === "form") {
    const editing = screen.editId ? getApplication(screen.editId) : null;
    return (
      <TrackerForm
        application={editing}
        letters={letters}
        onBack={() => setScreen({ type: "list" })}
        onSave={(data) => {
          if (screen.editId) {
            updateApplication(screen.editId, data);
          } else {
            createApplication(data);
          }
          setScreen({ type: "list" });
        }}
        onDelete={(id) => {
          deleteApplication(id);
          setScreen({ type: "list" });
        }}
      />
    );
  }

  return (
    <TrackerList
      applications={applications}
      letters={letters}
      onAddNew={() => setScreen({ type: "form" })}
      onEdit={(id) => setScreen({ type: "form", editId: id })}
    />
  );
}
