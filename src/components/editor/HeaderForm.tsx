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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Full Name
          </div>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Role Title
          </div>
          <input
            type="text"
            value={data.role}
            onChange={(e) => updateField("role", e.target.value)}
            className="w-full p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Software Engineer"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Address / Location
          </div>
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateField("address", e.target.value)}
            className="w-full p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="San Francisco, CA"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase block tracking-wider">
            Alignment
          </div>
          <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                onClick={() => updateField("align", align)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-all ${
                  data.align === align
                    ? "bg-white shadow-sm text-emerald-800 font-semibold ring-1 ring-black/5"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Links
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
                        className="flex gap-2 items-start group"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-move text-gray-300 hover:text-gray-500 p-1"
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
                            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="Label"
                          />
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) =>
                              updateLink(link.id, "url", e.target.value)
                            }
                            className="flex-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="URL"
                          />
                        </div>
                        <button
                          onClick={() => removeLink(link.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={15} />
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
          className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1.5 rounded-md hover:bg-emerald-50 transition-colors"
        >
          <Plus size={14} /> Add Link
        </button>
      </div>
    </div>
  );
}
