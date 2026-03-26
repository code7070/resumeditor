import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

import {
  Briefcase,
  FileText,
  Layers,
  Type,
  User,
  Sparkles,
  ChevronRight,
  Plus,
  MailOpen,
  ShieldCheck,
  GraduationCap,
  Star,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

import { HeaderForm } from "./editor/HeaderForm";
import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/Dialog";
import { Button } from "./ui/button";
import { SummaryForm } from "./editor/SummaryForm";
import { SectionEditor } from "./editor/SectionEditor";
import type { CVData, CustomSection, Header, ExperienceItem } from "../types";
import { ExperienceForm } from "./editor/ExperienceForm";
import { trackEvent } from "../lib/utils";
import type { AppView } from "../App";

interface AppSidebarProps {
  readonly data: CVData;
  readonly setData: React.Dispatch<React.SetStateAction<CVData>>;
  readonly confirmDelete: (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => void;
  readonly currentView: AppView;
  readonly onNavigate: (view: AppView) => void;
  readonly onOpenScanner: () => void;
}

export function AppSidebar({
  data,
  setData,
  confirmDelete,
  currentView,
  onNavigate,
  onOpenScanner,
}: AppSidebarProps) {
  // Dialog open states
  const [isHeaderDialogOpen, setIsHeaderDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [isFontDialogOpen, setIsFontDialogOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Draft states for modal editing
  const [draftHeader, setDraftHeader] = useState<Header | null>(null);
  const [draftSummary, setDraftSummary] = useState<string | null>(null);
  const [draftExperience, setDraftExperience] = useState<
    ExperienceItem[] | null
  >(null);
  const [draftSection, setDraftSection] = useState<CustomSection | null>(null);
  const [draftFont, setDraftFont] = useState<CVData["font"] | null>(null);

  const { setOpenMobile, isMobile } = useSidebar();

  const closeSidebarOnInteract = () => {
    if (isMobile) setOpenMobile(false);
  };

  // --- Open handlers (initialize drafts) ---
  const openHeaderDialog = useCallback(() => {
    setDraftHeader(structuredClone(data.header));
    setIsHeaderDialogOpen(true);
    trackEvent("section_edit_open", { section: "header" });
    closeSidebarOnInteract();
  }, [data.header]);

  const openSummaryDialog = useCallback(() => {
    setDraftSummary(data.summary);
    setIsSummaryDialogOpen(true);
    trackEvent("section_edit_open", { section: "summary" });
    closeSidebarOnInteract();
  }, [data.summary]);

  const openExperienceDialog = useCallback(() => {
    setDraftExperience(structuredClone(data.experience));
    setIsExperienceDialogOpen(true);
    trackEvent("section_edit_open", { section: "experience" });
    closeSidebarOnInteract();
  }, [data.experience]);

  const openFontDialog = useCallback(() => {
    setDraftFont(data.font);
    setIsFontDialogOpen(true);
    trackEvent("section_edit_open", { section: "font" });
    closeSidebarOnInteract();
  }, [data.font]);

  const openSectionDialog = useCallback(
    (sectionId: string) => {
      const section = data.customSections.find((s) => s.id === sectionId);
      if (section) {
        setDraftSection(structuredClone(section));
        setActiveSectionId(sectionId);
        trackEvent("section_edit_open", {
          section: "custom",
          name: section.name,
        });
        closeSidebarOnInteract();
      }
    },
    [data.customSections],
  );

  // --- Save handlers ---
  const saveHeader = () => {
    if (draftHeader) {
      setData((prev) => ({ ...prev, header: draftHeader }));
    }
    setIsHeaderDialogOpen(false);
  };

  const saveSummary = () => {
    if (draftSummary !== null) {
      setData((prev) => ({ ...prev, summary: draftSummary }));
    }
    setIsSummaryDialogOpen(false);
  };

  const saveExperience = () => {
    if (draftExperience) {
      setData((prev) => ({ ...prev, experience: draftExperience }));
    }
    setIsExperienceDialogOpen(false);
  };

  const saveFont = () => {
    if (draftFont) {
      setData((prev) => ({ ...prev, font: draftFont }));
    }
    setIsFontDialogOpen(false);
  };

  const saveSection = () => {
    if (draftSection) {
      setData((prev) => ({
        ...prev,
        customSections: prev.customSections.map((s) =>
          s.id === draftSection.id ? draftSection : s,
        ),
      }));
    }
    setActiveSectionId(null);
  };

  // --- Cancel handlers ---
  const cancelHeader = () => setIsHeaderDialogOpen(false);
  const cancelSummary = () => setIsSummaryDialogOpen(false);
  const cancelExperience = () => setIsExperienceDialogOpen(false);
  const cancelFont = () => setIsFontDialogOpen(false);
  const cancelSection = () => setActiveSectionId(null);

  // --- Section CRUD ---
  const handleAddSection = () => {
    const newSection: CustomSection = {
      id: crypto.randomUUID(),
      name: "New Section",
      items: [],
    };
    setData((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSection],
    }));
    // Open the newly created section immediately
    setDraftSection(structuredClone(newSection));
    setActiveSectionId(newSection.id);
    trackEvent("section_add");
    closeSidebarOnInteract();
  };

  const handleDeleteSection = (sectionId: string) => {
    const sectionToRemove = data.customSections.find((s) => s.id === sectionId);
    confirmDelete(
      "Remove Section",
      `Are you sure you want to remove "${
        sectionToRemove?.name || "this section"
      }"?`,
      () => {
        setData((prev) => ({
          ...prev,
          customSections: prev.customSections.filter((s) => s.id !== sectionId),
        }));
        setActiveSectionId(null);
      },
    );
  };

  const fontLabels: Record<CVData["font"], { name: string; desc: string }> = {
    serif: { name: "Serif", desc: "Classic, traditional look" },
    sans: { name: "Sans", desc: "Modern, clean appearance" },
    mono: { name: "Mono", desc: "Technical, code-like feel" },
  };

  return (
    <>
      <Sidebar collapsible="icon" variant="sidebar">
        {/* Header / Branding */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent-coral text-white">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-sidebar-foreground">
                      Resumaker
                    </span>
                    <span className="text-xs text-sidebar-foreground/50">
                      v0.1.0
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {currentView !== "editor" ? (
            /* Back to Resume — shown when in letter/tracker view */
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Back to Resume Editor"
                      onClick={() => {
                        onNavigate("editor");
                        closeSidebarOnInteract();
                      }}
                      className="text-white bg-accent-coral hover:text-accent-coral hover:bg-white font-medium"
                    >
                      <ArrowLeft />
                      <span>Resume Editor</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            /* RESUME SETTINGS — shown in editor view */
            <Collapsible defaultOpen className="group/resume-settings">
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between uppercase tracking-[3px] text-[11px] font-semibold text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors">
                    Resume Settings
                    <ChevronRight className="size-3 transition-transform duration-200 group-data-[state=open]/resume-settings:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {/* Header Details */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip="Header Details"
                          onClick={openHeaderDialog}
                        >
                          <User />
                          <span>Header Details</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Professional Summary */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip="Professional Summary"
                          onClick={openSummaryDialog}
                        >
                          <Sparkles />
                          <span>Professional Summary</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Experience */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip="Experience"
                          onClick={openExperienceDialog}
                        >
                          <Briefcase />
                          <span>Experience</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Education — placeholder */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip="Education (coming soon)"
                          disabled
                          className="opacity-40 cursor-not-allowed"
                        >
                          <GraduationCap />
                          <span>Education</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Skills — placeholder */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip="Skills (coming soon)"
                          disabled
                          className="opacity-40 cursor-not-allowed"
                        >
                          <Star />
                          <span>Skills</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Custom Sections */}
                      {data.customSections.map((section) => (
                        <SidebarMenuItem key={section.id}>
                          <SidebarMenuButton
                            tooltip={section.name || "Untitled Section"}
                            onClick={() => openSectionDialog(section.id)}
                          >
                            <Layers />
                            <span>{section.name || "Untitled Section"}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}

                      {/* Add Section */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={handleAddSection}
                          className="text-accent-coral hover:text-accent-coral hover:bg-accent-coral/10"
                        >
                          <Plus />
                          <span>Add Section</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Font Style — now opens modal */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip="Font Style"
                          onClick={openFontDialog}
                        >
                          <Type />
                          <span>Font Style</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          )}

          {/* TOOLS */}
          <Collapsible defaultOpen className="group/tools">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between uppercase tracking-[3px] text-[11px] font-semibold text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors">
                  Tools
                  <ChevronRight className="size-3 transition-transform duration-200 group-data-[state=open]/tools:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {/* Application Letter */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip="Application Letter"
                        isActive={currentView === "letter"}
                        onClick={() => {
                          onNavigate("letter");
                          trackEvent("navigate_letter");
                          closeSidebarOnInteract();
                        }}
                      >
                        <MailOpen />
                        <span>Application Letter</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* ATS Check */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip="ATS Check"
                        onClick={() => {
                          onOpenScanner();
                          trackEvent("section_edit_open", {
                            section: "ats_check",
                          });
                          closeSidebarOnInteract();
                        }}
                      >
                        <ShieldCheck />
                        <span>ATS Check</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Application Tracker */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip="Application Tracker"
                        isActive={currentView === "tracker"}
                        onClick={() => {
                          onNavigate("tracker");
                          trackEvent("navigate_tracker");
                          closeSidebarOnInteract();
                        }}
                      >
                        <ClipboardList />
                        <span>Application Tracker</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-1 flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs w-fit">
              <span className="opacity-50">Made with 💤 by</span>{" "}
              <a
                href="https://underline.id/"
                target="_blank"
                className="text-accent-coral underline"
              >
                Underline
              </a>
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* ===== MODALS ===== */}

      {/* Header Dialog */}
      <Dialog
        open={isHeaderDialogOpen}
        onOpenChange={(open) => !open && cancelHeader()}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Header Details</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            {draftHeader && (
              <HeaderForm
                data={draftHeader}
                onChange={setDraftHeader}
                confirmDelete={confirmDelete}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelHeader}>
              Cancel
            </Button>
            <Button onClick={saveHeader}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog
        open={isSummaryDialogOpen}
        onOpenChange={(open) => !open && cancelSummary()}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Professional Summary</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            {draftSummary !== null && (
              <SummaryForm
                data={draftSummary}
                onChange={setDraftSummary}
                fullData={data}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelSummary}>
              Cancel
            </Button>
            <Button onClick={saveSummary}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog
        open={isExperienceDialogOpen}
        onOpenChange={(open) => !open && cancelExperience()}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            {draftExperience && (
              <ExperienceForm
                data={draftExperience}
                onChange={setDraftExperience}
                confirmDelete={confirmDelete}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelExperience}>
              Cancel
            </Button>
            <Button onClick={saveExperience}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Font Settings Dialog */}
      <Dialog
        open={isFontDialogOpen}
        onOpenChange={(open) => !open && cancelFont()}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Font Style</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-3">
            {(["serif", "sans", "mono"] as const).map((font) => (
              <button
                key={font}
                onClick={() => setDraftFont(font)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  draftFont === font
                    ? "border-accent-coral bg-accent-coral-light ring-1 ring-accent-coral/20"
                    : "border-border hover:border-accent-coral/50 hover:bg-muted/50"
                }`}
              >
                <div
                  className={`text-2xl font-bold text-foreground w-12 text-center ${
                    font === "serif"
                      ? "font-serif"
                      : font === "sans"
                        ? "font-sans"
                        : "font-mono"
                  }`}
                >
                  Aa
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-foreground">
                    {fontLabels[font].name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fontLabels[font].desc}
                  </div>
                </div>
                {draftFont === font && (
                  <div className="w-5 h-5 rounded-full bg-accent-coral flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelFont}>
              Cancel
            </Button>
            <Button onClick={saveFont}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Editor Dialog */}
      {draftSection && (
        <Dialog
          open={!!activeSectionId}
          onOpenChange={(open) => !open && cancelSection()}
        >
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{`Edit ${draftSection.name || "Section"}`}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
              <SectionEditor
                section={draftSection}
                onChange={setDraftSection}
                onDelete={() => handleDeleteSection(draftSection.id)}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={cancelSection}>
                Cancel
              </Button>
              <Button onClick={saveSection}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
