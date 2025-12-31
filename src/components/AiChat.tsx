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
import type { ParsedResponse, ArtifactResponse } from "../lib/parseAIResponse";
import ArtifactCard from "./editor/ArtifactCard";

// Update Message interface to support both string and ParsedResponse
interface Message {
  role: "user" | "model";
  content: string | ParsedResponse;
  contexts?: string[];
}

interface AiChatProps {
  readonly data: CVData;
  readonly onClose?: () => void;
  readonly onUpdateCV?: (updates: Partial<CVData>) => void; // Add this for updating CV
}

const STORAGE_KEY = "ai-chat-history";

export function AiChat({ data, onClose, onUpdateCV }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
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
      const withoutFull = prev.filter((x) => x !== "full");
      const isSelected = withoutFull.includes(id);
      const next = isSelected
        ? withoutFull.filter((x) => x !== id)
        : [...withoutFull, id];
      return next.length === 0 ? ["full"] : next;
    });
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Handler untuk insert artifact ke CV
  const handleInsertToCV = (artifact: ArtifactResponse) => {
    if (!onUpdateCV) {
      alert("Insert feature not available");
      return;
    }

    try {
      switch (artifact.artifact_type) {
        case "summary": {
          // Convert plain text to HTML format for rich text editor
          let htmlContent = artifact.content.trim();

          // If content doesn't start with HTML tags, wrap in paragraph
          if (!htmlContent.startsWith("<")) {
            htmlContent = `<p>${htmlContent}</p>`;
          }

          onUpdateCV({ summary: htmlContent });
          alert("✅ Summary inserted to CV!");
          break;
        }

        case "experience": {
          // Handle both string and object content
          let experienceData;

          if (typeof artifact.content === "string") {
            // Parse the experience content and create a new experience item
            const lines = artifact.content.trim().split("\n");
            const title = lines[0] || "New Experience";
            const description = lines.slice(1).join("\n");

            experienceData = {
              id: crypto.randomUUID(),
              title: title,
              year: new Date().getFullYear().toString(),
              description: description,
              items: [],
            };
          } else {
            // AI returned structured object
            experienceData = {
              id: crypto.randomUUID(),
              title: artifact.content.title || "New Experience",
              year:
                artifact.content.year || new Date().getFullYear().toString(),
              description: artifact.content.description || "",
              items: artifact.content.items || [],
            };
          }

          onUpdateCV({
            experience: [...data.experience, experienceData],
          });
          alert("✅ Experience added to CV!");
          break;
        }

        case "skills": {
          // Handle both string and object content
          if (typeof artifact.content === "string") {
            // String content - convert to HTML format
            let htmlContent = artifact.content.trim();
            if (!htmlContent.startsWith("<")) {
              htmlContent = `<p>${htmlContent}</p>`;
            }

            // Create a new custom section for skills
            const skillsSection = data.customSections.find(
              (s) => s.name.toLowerCase() === "skills"
            );

            if (skillsSection) {
              // Add to existing skills section
              const newItem = {
                id: crypto.randomUUID(),
                title: "Skills",
                description: htmlContent,
                year: "",
              };
              const updatedSections = data.customSections.map((s) =>
                s.id === skillsSection.id
                  ? { ...s, items: [...s.items, newItem] }
                  : s
              );
              onUpdateCV({ customSections: updatedSections });
              alert("✅ Skills added to existing Skills section!");
            } else {
              // Create new skills section
              const newSection = {
                id: crypto.randomUUID(),
                name: "Skills",
                items: [
                  {
                    id: crypto.randomUUID(),
                    title: "Skills",
                    description: htmlContent,
                    year: "",
                  },
                ],
              };
              onUpdateCV({
                customSections: [...data.customSections, newSection],
              });
              alert("✅ New Skills section created and added to CV!");
            }
          } else {
            // Object content - check if it has items array
            if (Array.isArray(artifact.content.items)) {
              // AI returned structured skills with items array
              const skillItems = artifact.content.items.map((item: any) => {
                const description = item.description || "";
                const htmlDesc = description.startsWith("<")
                  ? description
                  : `<p>${description}</p>`;

                return {
                  id: crypto.randomUUID(),
                  title: item.title || "Skills",
                  description: htmlDesc,
                  year: item.year || "",
                };
              });

              const skillsSection = data.customSections.find(
                (s) => s.name.toLowerCase() === "skills"
              );

              if (skillsSection) {
                // Add all items to existing section
                const updatedSections = data.customSections.map((s) =>
                  s.id === skillsSection.id
                    ? { ...s, items: [...s.items, ...skillItems] }
                    : s
                );
                onUpdateCV({ customSections: updatedSections });
                alert(
                  `✅ ${skillItems.length} skill item(s) added to Skills section!`
                );
              } else {
                // Create new section with all items
                const newSection = {
                  id: crypto.randomUUID(),
                  name: "Skills",
                  items: skillItems,
                };
                onUpdateCV({
                  customSections: [...data.customSections, newSection],
                });
                alert(
                  `✅ New Skills section created with ${skillItems.length} item(s)!`
                );
              }
            } else {
              // Fallback: stringify the object
              const htmlContent = `<p>${JSON.stringify(
                artifact.content,
                null,
                2
              )}</p>`;

              const skillsSection = data.customSections.find(
                (s) => s.name.toLowerCase() === "skills"
              );

              if (skillsSection) {
                const newItem = {
                  id: crypto.randomUUID(),
                  title: "Skills",
                  description: htmlContent,
                  year: "",
                };
                const updatedSections = data.customSections.map((s) =>
                  s.id === skillsSection.id
                    ? { ...s, items: [...s.items, newItem] }
                    : s
                );
                onUpdateCV({ customSections: updatedSections });
                alert("✅ Skills added to existing Skills section!");
              } else {
                const newSection = {
                  id: crypto.randomUUID(),
                  name: "Skills",
                  items: [
                    {
                      id: crypto.randomUUID(),
                      title: "Skills",
                      description: htmlContent,
                      year: "",
                    },
                  ],
                };
                onUpdateCV({
                  customSections: [...data.customSections, newSection],
                });
                alert("✅ New Skills section created and added to CV!");
              }
            }
          }
          break;
        }

        case "bullet_points": {
          // Parse bullet points and add to the most recent experience
          if (data.experience.length === 0) {
            alert(
              "⚠️ No experience items found. Please add an experience first."
            );
            navigator.clipboard.writeText(artifact.content);
            return;
          }

          const bulletPoints = artifact.content
            .split("\n")
            .filter((line: string) => line.trim())
            .map((line: string) => ({
              id: crypto.randomUUID(),
              text: line.replace(/^[-*•]\s*/, "").trim(),
            }));

          const lastExperience = data.experience.at(-1)!;
          const updatedExperience = data.experience.map((exp) =>
            exp.id === lastExperience.id
              ? { ...exp, items: [...exp.items, ...bulletPoints] }
              : exp
          );

          onUpdateCV({ experience: updatedExperience });
          alert(
            `✅ ${bulletPoints.length} bullet point(s) added to "${lastExperience.title}"!`
          );
          break;
        }

        case "additional_section": {
          // Handle both string and object content
          if (typeof artifact.content === "string") {
            // String content - create single item
            let htmlContent = artifact.content.trim();
            if (!htmlContent.startsWith("<")) {
              htmlContent = `<p>${htmlContent}</p>`;
            }

            const sectionName =
              artifact.metadata?.section_name || "Additional Section";
            const itemTitle = artifact.metadata?.title || sectionName;
            const itemYear = artifact.metadata?.year || "";

            const existingSection = data.customSections.find(
              (s) => s.name.toLowerCase() === sectionName.toLowerCase()
            );

            if (existingSection) {
              const newItem = {
                id: crypto.randomUUID(),
                title: itemTitle,
                description: htmlContent,
                year: itemYear,
              };
              const updatedSections = data.customSections.map((s) =>
                s.id === existingSection.id
                  ? { ...s, items: [...s.items, newItem] }
                  : s
              );
              onUpdateCV({ customSections: updatedSections });
              alert(`✅ Content added to existing "${sectionName}" section!`);
            } else {
              const newSection = {
                id: crypto.randomUUID(),
                name: sectionName,
                items: [
                  {
                    id: crypto.randomUUID(),
                    title: itemTitle,
                    description: htmlContent,
                    year: itemYear,
                  },
                ],
              };
              onUpdateCV({
                customSections: [...data.customSections, newSection],
              });
              alert(`✅ New "${sectionName}" section created and added to CV!`);
            }
          } else {
            // Object content - check if it has items array
            const sectionName =
              artifact.metadata?.section_name ||
              artifact.content.name ||
              "Additional Section";

            if (Array.isArray(artifact.content.items)) {
              // AI returned structured section with items array
              const sectionItems = artifact.content.items.map((item: any) => {
                const description = item.description || "";
                const htmlDesc = description.startsWith("<")
                  ? description
                  : `<p>${description}</p>`;

                return {
                  id: crypto.randomUUID(),
                  title: item.title || sectionName,
                  description: htmlDesc,
                  year: item.year || "",
                };
              });

              const existingSection = data.customSections.find(
                (s) => s.name.toLowerCase() === sectionName.toLowerCase()
              );

              if (existingSection) {
                // Add all items to existing section
                const updatedSections = data.customSections.map((s) =>
                  s.id === existingSection.id
                    ? { ...s, items: [...s.items, ...sectionItems] }
                    : s
                );
                onUpdateCV({ customSections: updatedSections });
                alert(
                  `✅ ${sectionItems.length} item(s) added to "${sectionName}" section!`
                );
              } else {
                // Create new section with all items
                const newSection = {
                  id: crypto.randomUUID(),
                  name: sectionName,
                  items: sectionItems,
                };
                onUpdateCV({
                  customSections: [...data.customSections, newSection],
                });
                alert(
                  `✅ New "${sectionName}" section created with ${sectionItems.length} item(s)!`
                );
              }
            } else {
              // Single object without items array - treat as single item
              const itemTitle =
                artifact.metadata?.title ||
                artifact.content.title ||
                sectionName;
              const itemYear =
                artifact.metadata?.year || artifact.content.year || "";

              const description =
                artifact.content.description ||
                JSON.stringify(artifact.content, null, 2);

              const htmlContent = description.startsWith("<")
                ? description
                : `<p>${description}</p>`;

              const existingSection = data.customSections.find(
                (s) => s.name.toLowerCase() === sectionName.toLowerCase()
              );

              if (existingSection) {
                const newItem = {
                  id: crypto.randomUUID(),
                  title: itemTitle,
                  description: htmlContent,
                  year: itemYear,
                };
                const updatedSections = data.customSections.map((s) =>
                  s.id === existingSection.id
                    ? { ...s, items: [...s.items, newItem] }
                    : s
                );
                onUpdateCV({ customSections: updatedSections });
                alert(`✅ Content added to existing "${sectionName}" section!`);
              } else {
                const newSection = {
                  id: crypto.randomUUID(),
                  name: sectionName,
                  items: [
                    {
                      id: crypto.randomUUID(),
                      title: itemTitle,
                      description: htmlContent,
                      year: itemYear,
                    },
                  ],
                };
                onUpdateCV({
                  customSections: [...data.customSections, newSection],
                });
                alert(
                  `✅ New "${sectionName}" section created and added to CV!`
                );
              }
            }
          }
          break;
        }

        default:
          alert("✅ Content copied to clipboard!");
          navigator.clipboard.writeText(artifact.content);
      }
    } catch (error) {
      console.error("Error inserting to CV:", error);
      alert("❌ Failed to insert content. Content copied to clipboard.");
      navigator.clipboard.writeText(artifact.content);
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
      // chatWithGemini now returns ParsedResponse
      const response = await chatWithGemini(
        // Convert messages to format expected by chatWithGemini
        messages
          .map((m) => ({
            role: m.role,
            content:
              typeof m.content === "string"
                ? m.content
                : m.content.type === "chat"
                ? m.content.content
                : JSON.stringify(m.content),
          }))
          .concat({
            role: "user",
            content: input,
          }),
        data,
        selectedContexts
      );

      // Add the parsed response directly
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: {
            type: "chat",
            content: "Sorry, I encountered an error. Please try again.",
          },
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
      <ScrollArea className="flex-1 p-4 max-h-[calc(100vh-68px-230px)] md:max-h-[calc(100vh-56px-68px-230px)]">
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

          {messages.map((m, i) => {
            try {
              return (
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

                  {/* Message Content */}
                  {m.role === "user" ? (
                    <div className="rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm bg-primary text-primary-foreground rounded-tr-none">
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
                        {typeof m.content === "string"
                          ? m.content
                          : m.content.type === "chat"
                          ? m.content.content
                          : ""}
                      </p>
                    </div>
                  ) : (
                    // AI Response - check if it's chat or artifact
                    <div className="max-w-[85%]">
                      {typeof m.content === "string" ? (
                        // Legacy: plain string response
                        <div className="rounded-2xl px-4 py-2.5 shadow-sm bg-muted/80 backdrop-blur-sm rounded-tl-none border border-gray-100 dark:border-gray-800">
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-orange-600 dark:prose-code:text-orange-400 prose-headings:mb-2 prose-headings:mt-3 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ) : m.content.type === "chat" ? (
                        // Chat response
                        <div className="rounded-2xl px-4 py-2.5 shadow-sm bg-muted/80 backdrop-blur-sm rounded-tl-none border border-gray-100 dark:border-gray-800">
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-orange-600 dark:prose-code:text-orange-400 prose-headings:mb-2 prose-headings:mt-3 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.content.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ) : m.content.type === "artifact" ? (
                        // Artifact response - with explicit type guard
                        <ArtifactCard
                          artifact={m.content as ArtifactResponse}
                          onInsert={() =>
                            handleInsertToCV(m.content as ArtifactResponse)
                          }
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              );
            } catch (error) {
              console.error("Error rendering message:", error, m);
              return (
                <div
                  key={`error-${i}`}
                  className="flex gap-3 text-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <span className="text-red-600 dark:text-red-400 text-xs">
                    ⚠️ Error rendering message. Please clear chat history if
                    this persists.
                  </span>
                </div>
              );
            }
          })}

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
  const section = data.customSections.find((s) => s.id === contextId);
  return {
    icon: <Layers className="size-3" />,
    text: section?.name || "Custom Section",
  };
}
