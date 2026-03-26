import type { CustomSection, CustomSectionItem } from "../../types";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { RichTextEditor } from "./RichTextEditor";

interface SectionEditorProps {
  section: CustomSection;
  onChange: (updatedSection: CustomSection) => void;
  onDelete: () => void;
}

export function SectionEditor({
  section,
  onChange,
  onDelete,
}: Readonly<SectionEditorProps>) {
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
      {/* Section name + delete */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Section Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={section.name}
              onChange={(e) => updateSectionName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none font-bold transition-all"
              placeholder="E.g., Skills, Languages, Projects"
            />
            <button
              onClick={onDelete}
              className="px-3 py-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
              title="Delete Section"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-accent-coral rounded-full" />
            <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
              Items ({section.items.length})
            </label>
          </div>
          <button
            onClick={addItemToSection}
            className="flex items-center gap-1.5 text-xs text-accent-coral hover:text-accent-coral/80 font-semibold px-3 py-1.5 rounded-md hover:bg-accent-coral-light transition-colors border border-accent-coral/20"
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
                        className="p-3 bg-card border border-border rounded-lg space-y-3 relative group hover:shadow-sm transition-all"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-3 left-2 text-muted-foreground/30 hover:text-muted-foreground cursor-move z-10"
                        >
                          <GripVertical size={16} />
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute top-2 right-2 p-1 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                            className="col-span-2 px-3 py-2 bg-muted/50 text-foreground border border-transparent focus:bg-card focus:border-accent-coral rounded-md outline-none text-sm placeholder:text-muted-foreground/50 font-medium transition-all"
                            placeholder="Item Title"
                          />
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) =>
                              updateItem(item.id, "year", e.target.value)
                            }
                            className="col-span-1 px-3 py-2 bg-muted/50 text-foreground border border-transparent focus:bg-card focus:border-accent-coral rounded-md outline-none text-sm placeholder:text-muted-foreground/50 text-right transition-all"
                            placeholder="Year"
                          />
                        </div>
                        <div className="pl-6 pt-1">
                          <RichTextEditor
                            value={item.description}
                            onChange={(val: string) =>
                              updateItem(item.id, "description", val)
                            }
                            placeholder="Description"
                            className="min-h-[100px]"
                          />
                        </div>
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
