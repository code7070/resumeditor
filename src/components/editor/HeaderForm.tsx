import type { Header, Link } from "../../types";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

interface HeaderFormProps {
  readonly data: Header;
  readonly onChange: (data: Header) => void;
  readonly confirmDelete: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void;
}

export function HeaderForm({ data, onChange, confirmDelete }: HeaderFormProps) {
  const updateField = (field: keyof Header, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateLink = (id: string, field: keyof Link, value: string) => {
    const newLinks = data.links.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    onChange({ ...data, links: newLinks });
  };

  const addLink = () => {
    const newLink: Link = { id: crypto.randomUUID(), label: "", url: "" };
    onChange({ ...data, links: [...data.links, newLink] });
  };

  const removeLink = (id: string) => {
    const link = data.links.find((l) => l.id === id);
    confirmDelete(
      "Remove Link",
      `Delete ${link?.label || "this link"}?`,
      () => {
        onChange({ ...data, links: data.links.filter((l) => l.id !== id) });
      }
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(data.links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange({ ...data, links: items });
  };

  return (
    <div className="space-y-4">
      {/* Name + Role side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Role Title
          </label>
          <input
            type="text"
            value={data.role}
            onChange={(e) => updateField("role", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
            placeholder="Software Engineer"
          />
        </div>
      </div>

      {/* Location + Alignment side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Location
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateField("address", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none transition-all placeholder:text-muted-foreground/50"
            placeholder="San Francisco, CA"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Alignment
          </label>
          <div className="flex bg-muted p-1 rounded-lg border border-border w-fit">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                onClick={() => updateField("align", align)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-all ${
                  data.align === align
                    ? "bg-card shadow-sm text-accent-coral font-semibold ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Links section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-accent-coral rounded-full" />
          <label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Links
          </label>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="links">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {data.links.map((link, index) => (
                  <Draggable key={link.id} draggableId={link.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex gap-3 items-center group py-2"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-move text-muted-foreground/40 hover:text-muted-foreground p-0.5"
                        >
                          <GripVertical size={14} />
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 flex-1">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) =>
                              updateLink(link.id, "label", e.target.value)
                            }
                            className="flex-1 px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none text-sm placeholder:text-muted-foreground/50 transition-all"
                            placeholder="Label"
                          />
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) =>
                              updateLink(link.id, "url", e.target.value)
                            }
                            className="flex-2 px-3.5 py-2.5 bg-card text-foreground border border-border rounded-lg focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none text-sm placeholder:text-muted-foreground/50 transition-all"
                            placeholder="URL"
                          />
                        </div>
                        <button
                          onClick={() => removeLink(link.id)}
                          className="p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button
          onClick={addLink}
          className="flex items-center gap-1.5 text-xs text-accent-coral hover:text-accent-coral/80 font-semibold px-2 py-1.5 rounded-md hover:bg-accent-coral-light transition-colors"
        >
          <Plus size={14} /> Add Link
        </button>
      </div>
    </div>
  );
}
