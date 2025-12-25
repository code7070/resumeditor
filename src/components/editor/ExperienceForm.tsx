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
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Experience
          </h3>
          <button
            onClick={addExperience}
            className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 font-semibold px-3 py-1.5 rounded-md transition-colors border border-emerald-100"
          >
            <Plus size={14} /> Add Position
          </button>
        </div>
        <div className="p-4 bg-white">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="experience" type="EXPERIENCE_LIST">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
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
                            className="border border-gray-200 rounded-lg overflow-hidden bg-white ring-1 ring-black/0 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all"
                          >
                            <div
                              className={`flex justify-between items-center p-3 cursor-pointer transition-colors ${
                                isExpanded
                                  ? "bg-gray-50 border-b border-gray-200"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() =>
                                setExpandedId(isExpanded ? null : exp.id)
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-gray-300 hover:text-gray-500 p-1"
                                >
                                  <GripVertical size={16} />
                                </div>
                                <div className="font-semibold text-gray-700 text-sm">
                                  {exp.title || "Untitled Position"}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeExperience(exp.id);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                                {isExpanded ? (
                                  <ChevronUp
                                    size={16}
                                    className="text-gray-400"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={16}
                                    className="text-gray-400"
                                  />
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-4 space-y-4 bg-white cursor-default">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm placeholder:text-gray-400"
                                      placeholder="e.g. Senior Developer"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm placeholder:text-gray-400"
                                      placeholder="e.g. 2020 - Present"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none h-24 resize-none text-sm placeholder:text-gray-400 leading-relaxed"
                                    placeholder="Brief description of your role..."
                                  />
                                </div>

                                <div className="space-y-3 pt-2">
                                  <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                      Key Achievements
                                    </label>
                                    <button
                                      onClick={() =>
                                        addItemToExperience(exp.id)
                                      }
                                      className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1"
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
                                                className="flex gap-2 items-start bg-gray-50 p-2 rounded-lg group border border-transparent hover:border-gray-200 transition-colors"
                                              >
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="text-gray-300 hover:text-gray-500 cursor-move mt-2"
                                                >
                                                  <GripVertical size={14} />
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
                                                    className="w-full bg-transparent border-0 outline-none text-sm focus:ring-0 p-0 resize-none h-auto min-h-[1.5rem]"
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
                                                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No experience listed yet.
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
