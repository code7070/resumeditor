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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
} from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

import { HeaderForm } from "./editor/HeaderForm";
import { useState } from "react";
import { DialogApp } from "./ui/DialogApp";
import { SummaryForm } from "./editor/SummaryForm";
import { SectionEditor } from "./editor/SectionEditor";
import type { CVData, CustomSection } from "../types";
import { ExperienceForm } from "./editor/ExperienceForm";

interface AppSidebarProps {
  readonly data: CVData;
  readonly setData: React.Dispatch<React.SetStateAction<CVData>>;
  readonly confirmDelete: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void;
}

export function AppSidebar({ data, setData, confirmDelete }: AppSidebarProps) {
  const [isHeaderDialogOpen, setIsHeaderDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const { setOpenMobile, isMobile } = useSidebar();

  const closeSidebarOnInteract = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    // else {
    //   setOpen(false);
    // }
  };

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
    setActiveSectionId(newSection.id);
    closeSidebarOnInteract();
  };

  const handleUpdateSection = (updatedSection: CustomSection) => {
    setData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === updatedSection.id ? updatedSection : s
      ),
    }));
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
      }
    );
  };

  const activeSection = data.customSections.find(
    (s) => s.id === activeSectionId
  );

  return (
    <>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-orange-600 text-white">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Resumeditor</span>
                    <span className="">v0.0.1</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Resume Sections</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible asChild defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Font Style">
                        <Type />
                        <span>Font Style</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {(["serif", "sans", "mono"] as const).map((font) => (
                          <SidebarMenuSubItem key={font}>
                            <SidebarMenuSubButton
                              isActive={data.font === font}
                              onClick={() =>
                                setData((prev) => ({ ...prev, font }))
                              }
                              className="cursor-pointer"
                            >
                              <span className="capitalize">
                                {
                                  {
                                    serif: "Serif (Classic)",
                                    sans: "Sans (Modern)",
                                    mono: "Mono (Tech)",
                                  }[font]
                                }
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Header Details"
                    onClick={() => {
                      setIsHeaderDialogOpen(true);
                      closeSidebarOnInteract();
                    }}
                  >
                    <User />
                    <span>Header Details</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Professional Summary"
                    onClick={() => {
                      setIsSummaryDialogOpen(true);
                      closeSidebarOnInteract();
                    }}
                  >
                    <Sparkles />
                    <span>Professional Summary</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Experience"
                    onClick={() => {
                      setIsExperienceDialogOpen(true);
                      closeSidebarOnInteract();
                    }}
                  >
                    <Briefcase />
                    <span>Experience</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Additional Sections</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.customSections.map((section) => (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton
                      tooltip={section.name || "Untitled Section"}
                      onClick={() => {
                        setActiveSectionId(section.id);
                        closeSidebarOnInteract();
                      }}
                    >
                      <Layers />
                      <span>{section.name || "Untitled Section"}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleAddSection}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    <Plus />
                    <span>Add Section</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="text-xs">
            <span className="opacity-70">Made with lazy by</span>{" "}
            <a
              href="https://underline.id/"
              target="_blank"
              className="text-orange-600 hover:underline"
            >
              Underline
            </a>
          </div>
          <div className="p-1">
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      <DialogApp
        isOpen={isHeaderDialogOpen}
        onClose={() => setIsHeaderDialogOpen(false)}
        title="Edit Header Details"
      >
        <div className="max-h-[80vh] overflow-y-auto px-1">
          <HeaderForm
            data={data.header}
            onChange={(h) => setData((prev) => ({ ...prev, header: h }))}
            confirmDelete={confirmDelete}
          />
        </div>
      </DialogApp>

      <DialogApp
        isOpen={isSummaryDialogOpen}
        onClose={() => setIsSummaryDialogOpen(false)}
        title="Edit Professional Summary"
      >
        <div className="max-h-[80vh] overflow-y-auto px-1">
          <SummaryForm
            data={data.summary}
            onChange={(s) => setData((prev) => ({ ...prev, summary: s }))}
            fullData={data}
          />
        </div>
      </DialogApp>

      <DialogApp
        isOpen={isExperienceDialogOpen}
        onClose={() => setIsExperienceDialogOpen(false)}
        title="Edit Experience"
      >
        <div className="max-h-[80vh] overflow-y-auto px-1">
          <ExperienceForm
            data={data.experience}
            onChange={(exp) =>
              setData((prev) => ({ ...prev, experience: exp }))
            }
            confirmDelete={confirmDelete}
          />
        </div>
      </DialogApp>

      {activeSection && (
        <DialogApp
          isOpen={!!activeSectionId}
          onClose={() => setActiveSectionId(null)}
          title={`Edit ${activeSection.name || "Section"}`}
        >
          <div className="max-h-[80vh] overflow-y-auto px-1">
            <SectionEditor
              section={activeSection}
              onChange={handleUpdateSection}
              onDelete={() => handleDeleteSection(activeSection.id)}
            />
          </div>
        </DialogApp>
      )}
    </>
  );
}
