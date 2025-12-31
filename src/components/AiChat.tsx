import { useState, useRef, useEffect } from "react";
import {
  Send,
  User,
  Bot,
  Sparkles,
  Layout,
  FileText,
  Briefcase,
  Layers,
  Check,
  Trash2,
  X,
  MessageCircleX,
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { chatWithGemini } from "../services/gemini";
import type { CVData } from "../types";
import { cn } from "@/lib/utils";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "model";
  content: string;
  contexts?: string[];
}

interface AiChatProps {
  readonly data: CVData;
  readonly onClose?: () => void;
}

const STORAGE_KEY = "ai-chat-history";

export function AiChat({ data, onClose }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState<string[]>(["full"]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleContext = (id: string) => {
    if (id === "full") {
      setSelectedContexts(["full"]);
      return;
    }

    setSelectedContexts((prev) => {
      // If clicking something else while "full" is selected, clear "full" and select the thing
      const withoutFull = prev.filter((x) => x !== "full");
      const isSelected = withoutFull.includes(id);

      const next = isSelected
        ? withoutFull.filter((x) => x !== id)
        : [...withoutFull, id];

      // If nothing left after toggle, default to "full"
      return next.length === 0 ? ["full"] : next;
    });
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      contexts: [...selectedContexts],
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithGemini(
        [...messages, userMessage],
        data,
        selectedContexts
      );
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-600 rounded-lg text-white">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI Assistant</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
              CV Expert
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="secondary"
              size="icon"
              onClick={handleClearHistory}
              className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white"
              title="Clear chat history"
            >
              <MessageCircleX className="size-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground"
            >
              <Layout className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-4 max-h-[calc(100vh-68px-181px)] md:max-h-[calc(100vh-56px-68px-180px)]">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10 space-y-4">
              <div className="size-12 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center mx-auto text-orange-600">
                <Sparkles className="size-6" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Hello!</p>
                <p className="text-xs text-muted-foreground px-6 leading-relaxed">
                  I can help you audit your CV, refine your job descriptions, or
                  suggest missing keywords.
                </p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={`${i}-${m.role}`}
              className={cn(
                "flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-2",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700"
                )}
              >
                {m.role === "user" ? (
                  <User className="size-4" />
                ) : (
                  <Bot className="size-4" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/80 backdrop-blur-sm rounded-tl-none border border-gray-100 dark:border-gray-800"
                )}
              >
                {m.role === "user" ? (
                  <>
                    {m.contexts && m.contexts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-primary-foreground/20">
                        {m.contexts.map((ctx) => {
                          const label = getContextLabel(ctx, data);
                          return (
                            <span
                              key={ctx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-foreground/10 rounded-full text-[10px] font-medium"
                            >
                              {label.icon}
                              {label.text}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </p>
                  </>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-orange-600 dark:prose-code:text-orange-400 prose-headings:mb-2 prose-headings:mt-3 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-sm animate-in fade-in">
              <div className="size-8 rounded-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm">
                <Bot className="size-4 text-muted-foreground" />
              </div>
              <div className="bg-muted/80 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 border border-gray-100 dark:border-gray-800">
                <span className="size-1.5 bg-orange-600 rounded-full animate-bounce" />
                <span className="size-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <Scrollbar orientation="vertical" />
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/20 space-y-4">
        {/* Context Multi-Selection */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Analysis Context
          </p>
          <ScrollArea
            title="Contexts"
            className="w-full whitespace-nowrap pb-1"
          >
            <div className="flex gap-2 pb-1">
              <ContextPill
                label="Full CV"
                icon={<Layout className="size-3" />}
                active={selectedContexts.includes("full")}
                onClick={() => toggleContext("full")}
              />
              <ContextPill
                label="Summary"
                icon={<FileText className="size-3" />}
                active={selectedContexts.includes("summary")}
                onClick={() => toggleContext("summary")}
              />
              <ContextPill
                label="Experience"
                icon={<Briefcase className="size-3" />}
                active={selectedContexts.includes("experience")}
                onClick={() => toggleContext("experience")}
              />
              {data.customSections.map((s) => (
                <ContextPill
                  key={s.id}
                  label={s.name || "Untitled"}
                  icon={<Layers className="size-3" />}
                  active={selectedContexts.includes(s.id)}
                  onClick={() => toggleContext(s.id)}
                />
              ))}
            </div>
            <ScrollBar
              orientation="horizontal"
              className="bg-transparent hidden"
            />
          </ScrollArea>
        </div>

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="relative flex-1 group">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="min-h-[40px] max-h-[120px] resize-none bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl focus-visible:ring-orange-600 transition-all shadow-sm py-2.5 px-3"
              disabled={isLoading}
              rows={1}
            />
          </div>
          <Button
            size="icon"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 rounded-xl bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 shrink-0 transition-transform active:scale-95"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function ContextPill({
  label,
  icon,
  active,
  onClick,
}: {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly active: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer shadow-sm relative overflow-hidden",
        active
          ? "bg-orange-600 border-orange-600 text-white shadow-orange-600/20 pr-7"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-orange-200 dark:hover:border-orange-900/40"
      )}
    >
      {active ? <Check size={14} /> : icon}
      <span>{label}</span>
    </button>
  );
}

function getContextLabel(
  contextId: string,
  data: CVData
): { icon: React.ReactNode; text: string } {
  if (contextId === "full") {
    return { icon: <Layout className="size-3" />, text: "Full CV" };
  }
  if (contextId === "summary") {
    return { icon: <FileText className="size-3" />, text: "Summary" };
  }
  if (contextId === "experience") {
    return { icon: <Briefcase className="size-3" />, text: "Experience" };
  }
  // Custom section
  const section = data.customSections.find((s) => s.id === contextId);
  return {
    icon: <Layers className="size-3" />,
    text: section?.name || "Custom Section",
  };
}
