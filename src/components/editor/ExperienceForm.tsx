import type { ExperienceItem } from "../../types";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

interface ExperienceFormProps {
  readonly data: ExperienceItem[];
  readonly onChange: (data: ExperienceItem[]) => void;
  readonly confirmDelete: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void;
}

export function ExperienceForm({
  data,
  onChange,
  confirmDelete,
}: ExperienceFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    data?.[0]?.id || null
  );

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: crypto.randomUUID(),
      title: "New Position",
      year: "2023 - Present",
      description: "",
      items: [],
    };
    onChange([newExp, ...(data || [])]);
    setExpandedId(newExp.id);
  };

  const removeExperience = (id: string) => {
    const item = data.find((i) => i.id === id);
    confirmDelete(
      "Remove Experience",
      `Are you sure you want to remove "${
        item?.title || "this experience item"
      }"? All bullet points will be lost.`,
      () => {
        onChange(data.filter((item) => item.id !== id));
      }
    );
  };

  const updateExperience = (
    id: string,
    field: keyof ExperienceItem,
    value: any
  ) => {
    onChange(
      data?.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItemToExperience = (expId: string) => {
    const exp = data.find((item) => item.id === expId);
    if (exp) {
      updateExperience(expId, "items", [
        ...exp.items,
        { id: crypto.randomUUID(), text: "" },
      ]);
    }
  };

  const updateItemInExperience = (
    expId: string,
    itemId: string,
    value: string
  ) => {
    const exp = data.find((item) => item.id === expId);
    if (exp) {
      const newItems = exp.items.map((item) =>
        item.id === itemId ? { ...item, text: value } : item
      );
      updateExperience(expId, "items", newItems);
    }
  };

  const removeItemFromExperience = (expId: string, itemId: string) => {
    const exp = data.find((item) => item.id === expId);
    if (exp) {
      updateExperience(
        expId,
        "items",
        exp.items.filter((item) => item.id !== itemId)
      );
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // Handle "experience" list reordering
    if (result.type === "EXPERIENCE_LIST") {
      const items = Array.from(data || []);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      onChange(items);
      return;
    }

    // Handle nested "items" list reordering
    if (result.type.startsWith("ITEMS_LIST_")) {
      const expId = result.type.replace("ITEMS_LIST_", "");
      const exp = data.find((e) => e.id === expId);
      if (!exp) return;

      const newItems = Array.from(exp.items);
      const [reorderedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, reorderedItem);

      updateExperience(expId, "items", newItems);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section header with accent line */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-accent-coral rounded-full" />
          <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Positions
          </h3>
        </div>
        <button
          onClick={addExperience}
          className="flex items-center gap-1.5 text-xs text-accent-coral hover:text-accent-coral/80 font-semibold px-3 py-1.5 rounded-md hover:bg-accent-coral-light transition-colors border border-accent-coral/20"
        >
          <Plus size={14} /> Add Position
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="experience" type="EXPERIENCE_LIST">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {data?.map((exp, index) => {
                const isExpanded = expandedId === exp.id;
                return (
                  <Draggable
                    key={exp.id}
                    draggableId={exp.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border border-border rounded-lg overflow-hidden bg-card transition-all"
                      >
                        <div
                          className={`flex justify-between items-center p-3 cursor-pointer transition-colors ${
                            isExpanded
                              ? "bg-muted border-b border-border"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() =>
                            setExpandedId(isExpanded ? null : exp.id)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="text-muted-foreground/40 hover:text-muted-foreground p-1"
                            >
                              <GripVertical size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground text-sm">
                                {exp.title || "Untitled Position"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {exp.year}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeExperience(exp.id);
                              }}
                              className="p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                            {isExpanded ? (
                              <ChevronUp
                                size={16}
                                className="text-muted-foreground"
                              />
                            ) : (
                              <ChevronDown
                                size={16}
                                className="text-muted-foreground"
                              />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 space-y-4 cursor-default">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                                  Title / Company
                                </label>
                                <input
                                  type="text"
                                  value={exp.title}
                                  onChange={(e) =>
                                    updateExperience(
                                      exp.id,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all text-sm placeholder:text-muted-foreground/50"
                                  placeholder="e.g. Senior Developer"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                                  Year / Duration
                                </label>
                                <input
                                  type="text"
                                  value={exp.year}
                                  onChange={(e) =>
                                    updateExperience(
                                      exp.id,
                                      "year",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all text-sm placeholder:text-muted-foreground/50"
                                  placeholder="e.g. 2020 - Present"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                                Description
                              </label>
                              <textarea
                                value={exp.description}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none h-24 resize-none text-sm placeholder:text-muted-foreground/50 leading-relaxed"
                                placeholder="Brief description of your role..."
                              />
                            </div>

                            {/* Achievements */}
                            <div className="space-y-3 pt-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-3.5 bg-accent-coral rounded-full" />
                                  <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Achievements
                                  </label>
                                </div>
                                <button
                                  onClick={() =>
                                    addItemToExperience(exp.id)
                                  }
                                  className="text-xs text-accent-coral font-semibold hover:text-accent-coral/80 flex items-center gap-1"
                                >
                                  <Plus size={12} /> Add Item
                                </button>
                              </div>
                              <Droppable
                                droppableId={`items-${exp.id}`}
                                type={`ITEMS_LIST_${exp.id}`}
                              >
                                {(provided) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                  >
                                    {exp.items.map((item, idx) => (
                                      <Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={idx}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex gap-2.5 items-start bg-muted/50 py-2 px-3 rounded-lg group border border-transparent hover:border-border transition-colors"
                                          >
                                            <div
                                              {...provided.dragHandleProps}
                                              className="text-muted-foreground/30 hover:text-muted-foreground cursor-move mt-2"
                                            >
                                              <GripVertical size={12} />
                                            </div>
                                            <div className="w-4 h-4 mt-1.5 rounded-full border-2 border-accent-coral/30 flex items-center justify-center shrink-0">
                                              <div className="w-1.5 h-1.5 rounded-full bg-accent-coral/50" />
                                            </div>
                                            <div className="flex-1">
                                              <textarea
                                                value={item.text}
                                                onChange={(e) =>
                                                  updateItemInExperience(
                                                    exp.id,
                                                    item.id,
                                                    e.target.value
                                                  )
                                                }
                                                className="w-full bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-0 p-0 resize-none h-auto min-h-[1.5rem]"
                                                placeholder="Achievement or responsibility..."
                                                rows={Math.max(
                                                  1,
                                                  Math.ceil(
                                                    item.text.length / 60
                                                  )
                                                )}
                                              />
                                            </div>
                                            <button
                                              onClick={() =>
                                                removeItemFromExperience(
                                                  exp.id,
                                                  item.id
                                                )
                                              }
                                              className="p-1 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              {(!data || data.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No experience listed yet.
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
