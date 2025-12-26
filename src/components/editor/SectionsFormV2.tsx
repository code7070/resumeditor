import {
  Plus,
  Trash2,
  ChevronDown,
  GripVertical,
  Calendar,
  Layout,
  Type,
  AlignLeft,
} from "lucide-react";
import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type { CustomSection, CustomSectionItem } from "../../types";

interface SectionsFormProps {
  readonly data: CustomSection[];
  readonly onChange: (data: CustomSection[]) => void;
  readonly confirmDelete: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void;
}

export function SectionsFormV2({
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
      title: "",
      description: "",
      year: "",
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

    if (result.type === "SECTIONS_LIST") {
      const sections = Array.from(data || []);
      const [reorderedSection] = sections.splice(result.source.index, 1);
      sections.splice(result.destination.index, 0, reorderedSection);
      onChange(sections);
      return;
    }

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
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Layout className="w-5 h-5 text-emerald-500" />
            Additional Sections
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Customize your resume with specific sections like Projects,
            Volunteering, or Awards.
          </p>
        </div>
        <button
          onClick={addSection}
          className="group flex items-center gap-2 text-sm bg-gray-900 dark:bg-emerald-500/20 text-white dark:text-emerald-300 hover:bg-gray-800 dark:hover:bg-emerald-500/30 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Plus
            size={16}
            className="text-gray-300 group-hover:text-white dark:text-emerald-400 dark:group-hover:text-emerald-200 transition-colors"
          />
          <span className="font-medium">Add Section</span>
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections" type="SECTIONS_LIST">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-4"
            >
              {data?.map((section, index) => {
                const isExpanded = expandedSectionId === section.id;
                return (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 ${
                          snapshot.isDragging
                            ? "shadow-xl border-emerald-500/50 scale-102 z-50"
                            : isExpanded
                            ? "shadow-md border-emerald-100 dark:border-emerald-500/20 ring-1 ring-emerald-500/10"
                            : "shadow-sm border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-500/30"
                        }`}
                      >
                        {/* Section Header */}
                        <div
                          className={`flex justify-between items-center p-4 cursor-pointer select-none group ${
                            isExpanded
                              ? "border-b border-gray-100 dark:border-gray-700/50"
                              : ""
                          }`}
                          onClick={() =>
                            setExpandedSectionId(isExpanded ? null : section.id)
                          }
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              {...provided.dragHandleProps}
                              className="p-2 rounded-lg text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-400 transition-colors cursor-grab active:cursor-grabbing"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical size={18} />
                            </div>

                            <div className="flex-1">
                              <h4
                                className={`font-bold transition-colors ${
                                  section.name
                                    ? "text-gray-800 dark:text-gray-100"
                                    : "text-gray-400 italic"
                                }`}
                              >
                                {section.name || "Untitled Section"}
                              </h4>
                              <span className="text-xs text-xs text-gray-400 dark:text-gray-500">
                                {section.items.length}{" "}
                                {section.items.length === 1 ? "item" : "items"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSection(section.id);
                              }}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:text-gray-600 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title="Delete Section"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div
                              className={`p-2 rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors ${
                                isExpanded
                                  ? "rotate-180 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                                  : ""
                              }`}
                            >
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="p-5 animate-in slide-in-from-top-2 duration-200">
                            {/* Section Name Input */}
                            <div className="mb-8">
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 pl-1">
                                Section Title
                              </label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Type className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                  type="text"
                                  value={section.name}
                                  onChange={(e) =>
                                    updateSectionName(
                                      section.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Projects, Volunteer Work, Awards"
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                />
                              </div>
                            </div>

                            {/* Items List */}
                            <div className="space-y-4">
                              <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-700/50 pb-2 mb-4">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                                  Content Items
                                </label>
                                <button
                                  onClick={() => addItemToSection(section.id)}
                                  className="text-xs flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  <Plus size={14} strokeWidth={2.5} />
                                  Add Entry
                                </button>
                              </div>

                              <Droppable
                                droppableId={`items-${section.id}`}
                                type={`ITEMS_LIST_${section.id}`}
                              >
                                {(provided, itemSnapshot) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`space-y-4 min-h-[50px] ${
                                      itemSnapshot.isDraggingOver
                                        ? "bg-gray-50/50 dark:bg-gray-800/50 rounded-xl"
                                        : ""
                                    }`}
                                  >
                                    {section.items.map((item, idx) => (
                                      <Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={idx}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="group relative pl-8"
                                          >
                                            {/* Timeline Line */}
                                            <div className="absolute left-[15px] top-4 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-700 group-last:bottom-auto group-last:h-full -z-10"></div>
                                            <div className="absolute left-[8px] top-[26px] w-[15px] h-[15px] rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-600 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-colors shadow-sm z-0"></div>

                                            <div
                                              className={`
                                                relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all
                                                ${
                                                  snapshot.isDragging
                                                    ? "shadow-lg rotate-1 scale-102 border-emerald-400 z-50"
                                                    : "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                                                }
                                            `}
                                            >
                                              {/* Drag Handle */}
                                              <div
                                                {...provided.dragHandleProps}
                                                className="absolute right-3 top-3 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-move p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all"
                                              >
                                                <GripVertical size={16} />
                                              </div>

                                              {/* Delete Button */}
                                              <button
                                                onClick={() =>
                                                  removeItemFromSection(
                                                    section.id,
                                                    item.id
                                                  )
                                                }
                                                className="absolute -right-2 -top-2 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 dark:border-gray-700 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20"
                                                title="Remove Item"
                                              >
                                                <Trash2 size={12} />
                                              </button>

                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {/* Title */}
                                                <div className="md:col-span-3 space-y-1">
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Title / Role
                                                  </label>
                                                  <div className="relative">
                                                    <Type className="absolute left-3 top-2.5 w-4 h-4 text-gray-300 dark:text-gray-600" />
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
                                                      placeholder="e.g. Project Manager"
                                                      className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-semibold text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400"
                                                    />
                                                  </div>
                                                </div>

                                                {/* Year */}
                                                <div className="md:col-span-1 space-y-1">
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Date / Year
                                                  </label>
                                                  <div className="relative">
                                                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-300 dark:text-gray-600" />
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
                                                      placeholder="2023"
                                                      className="w-full pl-9 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-medium text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400"
                                                    />
                                                  </div>
                                                </div>

                                                {/* Description */}
                                                <div className="md:col-span-4 space-y-1">
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Details
                                                  </label>
                                                  <div className="relative">
                                                    <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-300 dark:text-gray-600" />
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
                                                      placeholder="Describe your achievements..."
                                                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm min-h-[80px] text-gray-600 dark:text-gray-300 leading-relaxed resize-y placeholder-gray-400"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {section.items.length === 0 && (
                                      <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                                        <p className="text-sm text-gray-400 font-medium">
                                          No items yet
                                        </p>
                                        <button
                                          onClick={() =>
                                            addItemToSection(section.id)
                                          }
                                          className="mt-2 text-xs text-emerald-600 font-bold hover:underline"
                                        >
                                          Add your first item
                                        </button>
                                      </div>
                                    )}
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
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Layout size={32} opacity={0.5} />
                  </div>
                  <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">
                    Add Custom Sections
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
                    Add custom lists for Awards, Certifications, Languages, or
                    Volunteering to make your resume stand out.
                  </p>
                  <button
                    onClick={addSection}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={18} /> Add New Section
                  </button>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
