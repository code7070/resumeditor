import type { CustomSection, CustomSectionItem } from "../../types";
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

interface SectionsFormProps {
  readonly data: CustomSection[];
  readonly onChange: (data: CustomSection[]) => void;
  readonly confirmDelete: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void;
}

export function SectionsForm({
  data,
  onChange,
  confirmDelete,
}: SectionsFormProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    null
  );

  const addSection = () => {
    const newSection: CustomSection = {
      id: crypto.randomUUID(),
      name: "New Section",
      items: [],
    };
    onChange([...(data || []), newSection]);
    setExpandedSectionId(newSection.id);
  };

  const removeSection = (id: string) => {
    const sectionToRemove = data.find((s) => s.id === id);
    confirmDelete(
      "Remove Section",
      `Are you sure you want to remove "${
        sectionToRemove?.name || "this section"
      }"? All items within this section will be lost.`,
      () => {
        onChange(data.filter((s) => s.id !== id));
      }
    );
  };

  const updateSectionName = (id: string, name: string) => {
    onChange(data?.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const addItemToSection = (sectionId: string) => {
    const newItem: CustomSectionItem = {
      id: crypto.randomUUID(),
      title: "Item Title",
      description: "Description",
      year: "2023",
    };
    onChange(
      data?.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      )
    );
  };

  const updateItemInSection = (
    sectionId: string,
    itemId: string,
    field: keyof CustomSectionItem,
    value: string
  ) => {
    onChange(
      data?.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          items: s.items.map((item) =>
            item.id === itemId ? { ...item, [field]: value } : item
          ),
        };
      })
    );
  };

  const removeItemFromSection = (sectionId: string, itemId: string) => {
    onChange(
      data?.map((s) => {
        if (s.id !== sectionId) return s;
        return { ...s, items: s.items.filter((item) => item.id !== itemId) };
      })
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // Handle "sections" list reordering
    if (result.type === "SECTIONS_LIST") {
      const sections = Array.from(data || []);
      const [reorderedSection] = sections.splice(result.source.index, 1);
      sections.splice(result.destination.index, 0, reorderedSection);
      onChange(sections);
      return;
    }

    // Handle nested "items" list reordering
    if (result.type.startsWith("ITEMS_LIST_")) {
      const sectionId = result.type.replace("ITEMS_LIST_", "");
      const section = data.find((s) => s.id === sectionId);
      if (!section) return;

      const newItems = Array.from(section.items);
      const [reorderedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, reorderedItem);

      onChange(
        data.map((s) => (s.id === sectionId ? { ...s, items: newItems } : s))
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            Additional Sections
          </h3>
          <button
            onClick={addSection}
            className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-800 dark:hover:text-emerald-200 font-semibold px-3 py-1.5 rounded-md transition-colors border border-emerald-100 dark:border-emerald-800"
          >
            <Plus size={14} /> Add Section
          </button>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections" type="SECTIONS_LIST">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {data?.map((section, index) => {
                    const isExpanded = expandedSectionId === section.id;
                    return (
                      <Draggable
                        key={section.id}
                        draggableId={section.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 ring-1 ring-black/0 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all"
                          >
                            <div
                              className={`flex justify-between items-center p-3 cursor-pointer transition-colors ${
                                isExpanded
                                  ? "bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              }`}
                              onClick={() =>
                                setExpandedSectionId(
                                  isExpanded ? null : section.id
                                )
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 p-1"
                                >
                                  <GripVertical size={16} />
                                </div>
                                <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                                  {section.name || "Untitled Section"}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSection(section.id);
                                  }}
                                  className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                                {isExpanded ? (
                                  <ChevronUp
                                    size={16}
                                    className="text-gray-400 dark:text-gray-500"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={16}
                                    className="text-gray-400 dark:text-gray-500"
                                  />
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4 bg-white dark:bg-gray-800 cursor-default">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Section Name
                                  </label>
                                  <input
                                    type="text"
                                    value={section.name}
                                    onChange={(e) =>
                                      updateSectionName(
                                        section.id,
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 outline-none font-bold text-emerald-900 transition-all"
                                  />
                                </div>

                                <div className="space-y-3 pl-3 border-l-2 border-emerald-50 dark:border-emerald-900/30">
                                  <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Items
                                    </label>
                                    <button
                                      onClick={() =>
                                        addItemToSection(section.id)
                                      }
                                      className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold hover:text-emerald-800 dark:hover:text-emerald-200 flex items-center gap-1"
                                    >
                                      <Plus size={12} /> Add Item
                                    </button>
                                  </div>

                                  <Droppable
                                    droppableId={`items-${section.id}`}
                                    type={`ITEMS_LIST_${section.id}`}
                                  >
                                    {(provided) => (
                                      <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3"
                                      >
                                        {section.items.map((item, idx) => (
                                          <Draggable
                                            key={item.id}
                                            draggableId={item.id}
                                            index={idx}
                                          >
                                            {(provided) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3 relative group border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
                                              >
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="absolute top-3 left-2 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-move z-10"
                                                >
                                                  <GripVertical size={16} />
                                                </div>

                                                <button
                                                  onClick={() =>
                                                    removeItemFromSection(
                                                      section.id,
                                                      item.id
                                                    )
                                                  }
                                                  className="absolute top-2 right-2 p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                  <Trash2 size={14} />
                                                </button>

                                                <div className="grid grid-cols-3 gap-2 pl-6">
                                                  <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) =>
                                                      updateItemInSection(
                                                        section.id,
                                                        item.id,
                                                        "title",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="col-span-2 p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-md focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                                                    placeholder="Item Title"
                                                  />
                                                  <input
                                                    type="text"
                                                    value={item.year}
                                                    onChange={(e) =>
                                                      updateItemInSection(
                                                        section.id,
                                                        item.id,
                                                        "year",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="col-span-1 p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-md focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                                                    placeholder="Year"
                                                  />
                                                </div>
                                                <textarea
                                                  value={item.description}
                                                  onChange={(e) =>
                                                    updateItemInSection(
                                                      section.id,
                                                      item.id,
                                                      "description",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="w-full p-2 ml-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-md focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-sm h-16 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                  placeholder="Description"
                                                  style={{
                                                    width:
                                                      "calc(100% - 1.5rem)",
                                                  }}
                                                />
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
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      No custom sections added.
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
