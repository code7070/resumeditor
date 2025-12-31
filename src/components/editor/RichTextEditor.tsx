import { useCallback, useMemo, useState, useEffect } from "react";
import { Editable, withReact, Slate, useSlate, ReactEditor } from "slate-react";
import {
  Editor,
  Transforms,
  createEditor,
  type Descendant,
  Element as SlateElement,
  Text as SlateText,
  Range as SlateRange,
  type BaseEditor,
} from "slate";
import { withHistory, type HistoryEditor } from "slate-history";
import {
  Bold,
  Italic,
  Underline,
  List,
  Link as LinkIcon,
  Link2Off,
} from "lucide-react";
import { jsx } from "slate-hyperscript";

// --- Types & Constants ---

type CustomElement = {
  type: "paragraph" | "link" | "bulleted-list" | "list-item";
  url?: string;
  children: Descendant[];
};
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const ELEMENT_TAGS: Record<string, (el: HTMLElement) => any> = {
  A: (el: HTMLElement) => ({ type: "link", url: el.getAttribute("href") }),
  P: () => ({ type: "paragraph" }),
  UL: () => ({ type: "bulleted-list" }),
  LI: () => ({ type: "list-item" }),
};

const TEXT_TAGS: Record<string, (el: HTMLElement) => any> = {
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  STRONG: () => ({ bold: true }),
  B: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

// --- Deserialization ---

const applyMark = (node: any, attrs: any): any => {
  if (typeof node === "string") {
    return jsx("text", attrs, node);
  }
  if (SlateText.isText(node)) {
    return { ...node, ...attrs };
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map((c: any) => applyMark(c, attrs)),
    };
  }
  return node;
};

export const deserialize = (el: Node): any => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }

  const { nodeName } = el;
  let parent = el;

  let children = Array.from(parent.childNodes)
    .flatMap(deserialize)
    .filter((c) => c !== null);

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  if (nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el as HTMLElement);
    // Ensure nested links/paragraphs are handled, though shouldn't happen
    return jsx("element", attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el as HTMLElement);
    return children.length === 1 && typeof children[0] === "string"
      ? jsx("text", attrs, children[0])
      : children.map((child: any) => applyMark(child, attrs));
  }

  return children;
};

// --- Serialization ---

const serializeText = (node: CustomText) => {
  let text = node.text || "";
  if (node.bold) text = `<strong>${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;
  return text;
};

const serializeElement = (node: CustomElement): string => {
  const children = (node.children || [])
    .map((n) => {
      if (SlateText.isText(n)) return serializeText(n as any);
      return serializeElement(n as any);
    })
    .join("");

  if (node.type === "paragraph") {
    return `<p>${children}</p>`;
  }
  if (node.type === "link") {
    return `<a href="${node.url}">${children}</a>`;
  }
  if (node.type === "bulleted-list") {
    return `<ul>${children}</ul>`;
  }
  if (node.type === "list-item") {
    return `<li>${children}</li>`;
  }
  return children;
};

const serialize = (nodes: Descendant[]) => {
  return nodes
    .map((n) => {
      if (SlateText.isText(n)) return serializeText(n as any);
      return serializeElement(n as any);
    })
    .join("");
};

// --- Editor Helpers ---

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = ["bulleted-list", "list-item"].includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ["bulleted-list"].includes((n as any).type),
    split: true,
  });

  let type: string;
  if (isActive) {
    type = "paragraph";
  } else if (isList) {
    type = "list-item";
  } else {
    type = format;
  }

  const newProperties: Partial<SlateElement> = {
    type: type as any,
  };
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block as any);
  }
};

const isBlockActive = (editor: Editor, format: string) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as any).type === format,
    })
  );

  return !!match;
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? (marks as any)[format] === true : false;
};

const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as any).type === "link",
  });
  return !!link;
};

const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as any).type === "link",
  });
};

const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && SlateRange.isCollapsed(selection);
  const link = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link as any);
  } else {
    Transforms.wrapNodes(editor, link as any, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

const insertLink = (editor: Editor) => {
  const url = globalThis.prompt("Enter the URL of the link:");
  if (!url) return;
  wrapLink(editor, url);
};

// --- Components ---

const MarkButton = ({ format, icon: Icon }: { format: string; icon: any }) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);
  return (
    <button
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      <Icon size={16} />
    </button>
  );
};

const LinkButton = () => {
  const editor = useSlate();
  const isActive = isLinkActive(editor);
  return (
    <button
      onMouseDown={(event) => {
        event.preventDefault();
        if (isActive) {
          unwrapLink(editor);
        } else {
          insertLink(editor);
        }
      }}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {isActive ? <Link2Off size={16} /> : <LinkIcon size={16} />}
    </button>
  );
};

const BlockButton = ({ format, icon: Icon }: { format: string; icon: any }) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);
  return (
    <button
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      <Icon size={16} />
    </button>
  );
};

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

const Element = ({ attributes, children, element }: any) => {
  if (element.type === "link") {
    return (
      <a
        {...attributes}
        href={element.url}
        className="text-emerald-600 underline cursor-pointer"
      >
        {children}
      </a>
    );
  }
  if (element.type === "bulleted-list") {
    return (
      <ul {...attributes} className="list-disc list-outside ml-4 my-2">
        {children}
      </ul>
    );
  }
  if (element.type === "list-item") {
    return <li {...attributes}>{children}</li>;
  }
  return <p {...attributes}>{children}</p>;
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: Readonly<RichTextEditorProps>) {
  const [editor] = useState(() => {
    const e = withHistory(withReact(createEditor() as any));
    const { isInline } = e;
    e.isInline = (element: any) => {
      return element.type === "link" ? true : isInline(element);
    };
    return e;
  });

  const initialValue = useMemo(() => {
    try {
      if (!value) return [{ type: "paragraph", children: [{ text: "" }] }];
      const document = new DOMParser().parseFromString(value, "text/html");
      const nodes = deserialize(document.body);
      if (Array.isArray(nodes) && nodes.length > 0) return nodes;
      return [{ type: "paragraph", children: [{ text: "" }] }];
    } catch (e) {
      console.error("Failed to parse initial rich text value:", e);
      return [{ type: "paragraph", children: [{ text: "" }] }];
    }
  }, []); // Only parse initial value once

  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  // Sync external value changes (like AI refinement)
  useEffect(() => {
    const currentHtml = serialize(editor.children);
    if (value !== currentHtml) {
      try {
        const document = new DOMParser().parseFromString(
          value || "<p></p>",
          "text/html"
        );
        const nodes = deserialize(document.body);

        // Clear and replace editor content
        Transforms.removeNodes(editor, { at: [] });
        Transforms.insertNodes(editor, nodes, { at: [0] });
      } catch (e) {
        console.error("Failed to sync rich text value:", e);
      }
    }
  }, [value, editor]);

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col bg-white dark:bg-gray-900 ${className}`}
    >
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(val) => {
          const isAstChange = editor.operations.some(
            (op: any) => "set_selection" !== op.type
          );
          if (isAstChange) {
            onChange(serialize(val));
          }
        }}
      >
        <div className="flex items-center gap-1 p-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <MarkButton format="bold" icon={Bold} />
          <MarkButton format="italic" icon={Italic} />
          <MarkButton format="underline" icon={Underline} />
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
          <BlockButton format="bulleted-list" icon={List} />
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
          <LinkButton />
        </div>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={placeholder}
          className="p-3 min-h-[150px] outline-none text-sm leading-relaxed text-gray-900 dark:text-gray-100"
        />
      </Slate>
    </div>
  );
}
