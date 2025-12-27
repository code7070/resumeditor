import type { CustomSection, CustomSectionItem } from "../../types";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

interface SectionEditorProps {
  section: CustomSection;
  onChange: (updatedSection: CustomSection) => void;
  onDelete: () => void;
}

export function SectionEditor({
  section,
  onChange,
  onDelete,
}: SectionEditorProps) {
  const updateSectionName = (name: string) => {
    onChange({ ...section, name });
  };

  const addItemToSection = () => {
    const newItem: CustomSectionItem = {
      id: crypto.randomUUID(),
      title: "Item Title",
      description: "Description",
      year: "2023",
    };
    onChange({ ...section, items: [...section.items, newItem] });
  };

  const updateItem = (
    itemId: string,
    field: keyof CustomSectionItem,
    value: string
  ) => {
    onChange({
      ...section,
      items: section.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  const removeItem = (itemId: string) => {
    onChange({
      ...section,
      items: section.items.filter((item) => item.id !== itemId),
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    if (result.type === "ITEMS_LIST") {
      const newItems = Array.from(section.items);
      const [reorderedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, reorderedItem);
      onChange({ ...section, items: newItems });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Section Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={section.name}
              onChange={(e) => updateSectionName(e.target.value)}
              className="flex-1 p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 outline-none font-bold text-emerald-900 transition-all"
              placeholder="E.g., Skills, Languages, Projects"
            />
            <button
              onClick={onDelete}
              className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900"
              title="Delete Section"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Items ({section.items.length})
          </label>
          <button
            onClick={addItemToSection}
            className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-800 dark:hover:text-emerald-200 font-semibold px-3 py-1.5 rounded-md transition-colors border border-emerald-100 dark:border-emerald-800"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`items-${section.id}`} type="ITEMS_LIST">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 min-h-[50px]"
              >
                {section.items.map((item, idx) => (
                  <Draggable key={item.id} draggableId={item.id} index={idx}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 relative group hover:shadow-sm transition-all"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-3 left-2 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-move z-10"
                        >
                          <GripVertical size={16} />
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Item"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="grid grid-cols-3 gap-2 pl-6">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              updateItem(item.id, "title", e.target.value)
                            }
                            className="col-span-2 p-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-transparent focus:bg-white dark:focus:bg-gray-950 border-gray-100 dark:border-gray-800 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-md outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium transition-all"
                            placeholder="Item Title"
                          />
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) =>
                              updateItem(item.id, "year", e.target.value)
                            }
                            className="col-span-1 p-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-transparent focus:bg-white dark:focus:bg-gray-950 border-gray-100 dark:border-gray-800 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-md outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right transition-all"
                            placeholder="Year"
                          />
                        </div>
                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          className="w-full p-2 ml-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-transparent focus:bg-white dark:focus:bg-gray-950 border-gray-100 dark:border-gray-800 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-md outline-none text-sm h-16 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                          placeholder="Description"
                          style={{
                            width: "calc(100% - 1.5rem)",
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
        </DragDropContext>
      </div>
    </div>
  );
}
