export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface Header {
  name: string;
  role: string;
  address: string;
  links: Link[];
  align?: "left" | "center" | "right";
}

export interface ExperienceItem {
  id: string;
  title: string;
  year: string;
  description: string;
  items: { id: string; text: string }[]; // Bullet points or achievements
}

export interface CustomSectionItem {
  id: string;
  title: string;
  description: string;
  year: string;
}

export interface CustomSection {
  id: string;
  name: string;
  items: CustomSectionItem[];
}

export interface CVData {
  header: Header;
  summary: string;
  experience: ExperienceItem[];
  customSections: CustomSection[];
  font: "serif" | "sans" | "mono";
  lastSaved?: string;
}

export interface ApplicationLetter {
  id: string;
  companyName: string;
  position: string;
  jobDescription: string;
  content: string;
  recipientName?: string;
  recipientAddress?: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "sent" | "archived";
}

export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  status: ApplicationStatus;
  appliedDate: string;
  jobUrl?: string;
  letterId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const initialCVData: CVData = {
  font: "serif",
  header: {
    name: "John Doe",
    role: "Software Engineer",
    address: "San Francisco, CA",
    align: "left",
    links: [
      { id: "1", label: "Email", url: "mailto:john@example.com" },
      { id: "2", label: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
      { id: "3", label: "GitHub", url: "https://github.com/johndoe" },
    ],
  },
  summary:
    "Results-oriented software engineer with expertise in building scalable web applications. Passionate about clean code, performance optimization, and user experience.",
  experience: [
    {
      id: "1",
      title: "Senior Developer at Tech Corp",
      year: "2020 - Present",
      description:
        "Leading the frontend team in migrating legacy systems to React.",
      items: [
        { id: "1", text: "Improved site performance by 40%" },
        { id: "2", text: "Mentored junior developers" },
        { id: "3", text: "Architected a new design system" },
      ],
    },
  ],
  customSections: [
    {
      id: "1",
      name: "Education",
      items: [
        {
          id: "1",
          title: "BS Computer Science",
          description: "University of Technology",
          year: "2016-2020",
        },
      ],
    },
  ],
};
