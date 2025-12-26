# CV Builder - Project Overview

## 📋 Project Description

**CV Builder** is a modern web application for creating and managing professional CV/Resumes. This application provides an interactive editor with real-time preview and is equipped with AI-powered features to enhance resume quality.

## 🎯 Main Objectives

- Provide an easy-to-use platform for creating professional CVs
- Deliver ATS (Applicant Tracking System) feedback to improve screening success rates
- Assist users with AI to refine CV content
- Support import and export in various formats

## 🛠️ Tech Stack

### Frontend

- **React 19.2.0** - UI library
- **TypeScript** - Type safety
- **Vite 7.2.4** - Build tool & dev server
- **Tailwind CSS 4.1.18** - Styling framework

### AI & Data Processing

- **Google Generative AI (Gemini 2.5 Flash)** - AI content refinement & analysis
- **PDF.js 3.11.174** - PDF parsing and import
- **p5.js 2.1.2** - Generative art visualization

### UI/UX Libraries

- **Lucide React** - Icon library
- **@hello-pangea/dnd** - Drag and drop functionality
- **clsx & tailwind-merge** - Class name utilities

### Development Tools

- **ESLint** - Code linting
- **Parcel** - Alternative bundler for production bundle

---

## ✨ Main Features

### 1. **Interactive Editor**

- **Split View Layout**: Editor sidebar with real-time preview
- **Dark Mode**: Dark and light themes with toggle
- **Drag & Drop**: Reorder sections and items with drag-and-drop
- **Font Format**: Choice of serif, sans-serif, or monospace fonts

### 2. **Header & Contact Management**

- Input for name, role/position, and address
- Multiple contact links (Email, LinkedIn, GitHub, Portfolio, etc.)
- Header alignment options (left, center, right)
- Dynamic link management with add/remove functionality

### 3. **Professional Summary**

- Editor for professional summary
- **AI Text Refinement**: Uses Gemini AI to refine summary text for more professional and impactful content

### 4. **Experience Section**

- Manage multiple work experiences
- Each experience includes:
  - Job title
  - Year/duration
  - Description
  - Bullet points for achievements
- Drag & drop to reorder experiences and bullet points

### 5. **Custom Sections**

- Create unlimited custom sections (Education, Skills, Projects, Certifications, etc.)
- Each section can have multiple items
- Flexible structure: title, description, year for each item
- Rename, add, remove sections as needed

### 6. **ATS Analysis & Scoring**

Comprehensive ATS analysis features:

- **ATS Score (0-100)**: Overall CV evaluation against ATS standards
- **Strengths**: List of CV strengths
- **Improvements**: Specific improvement suggestions
- **Missing Keywords**: Important keywords that might be missing
- **Formatting Feedback**: Feedback on CV format

**ATS Visual Dashboard**:

- Generative art visualization using p5.js
- Dual canvas display:
  - **Narrative Signal**: Visualization of CV data resonance
  - **Spectral Density**: Visualization of score distribution
- Score breakdown with categorization (Excellent, Good, Fair, Needs Work, Critical)
- Detailed analysis cards for each category
- History tracking for multiple ATS scans

**ATS Rule-Set**:

- Comprehensive ATS guidelines embedded in the system
- Covers format, content, keywords, and best practices
- Used as reference for AI analysis

### 7. **PDF Import**

- **AI-Powered PDF Parsing**: Upload PDF resume and automatically extract data
- Consent dialog for AI processing
- Structured data extraction:
  - Header information
  - Professional summary
  - Work experience with bullet points
  - Custom sections (Education, Skills, etc.)
- Preserves structure and formatting from original PDF

### 8. **Export & Sharing**

Multiple export formats:

- **JSON**: Export/import CV data for backup or transfer
- **Markdown (.md)**: Export to markdown format
- **LaTeX (.tex)**: Export for academic CV formatting
- **Print/PDF**: Print directly to PDF using browser print dialog

### 9. **UI/UX Features**

- **Responsive Design**: Mobile-friendly layout
- **Confirmation Dialogs**: Protection from accidental deletions
- **Loading States**: Visual feedback for AI operations
- **Error Handling**: Graceful error messages
- **Print Optimized**: Print stylesheet for clean PDF output

---

## 📁 Project Structure

```
cv-builder/
├── src/
│   ├── components/
│   │   ├── Editor.tsx              # Main editor component
│   │   ├── Preview.tsx             # CV preview component
│   │   ├── ATSAnalysisArt.tsx      # ATS visualization with p5.js
│   │   ├── editor/
│   │   │   ├── HeaderForm.tsx      # Form for header section
│   │   │   ├── ExperienceForm.tsx  # Form for experience section
│   │   │   └── SectionsForm.tsx    # Form for custom sections
│   │   └── ui/
│   │       ├── Dialog.tsx          # Reusable dialog component
│   │       ├── ConfirmDialog.tsx   # Confirmation dialog
│   │       └── ThemeToggle.tsx     # Dark mode toggle
│   ├── context/
│   │   └── ThemeContext.tsx        # Theme management context
│   ├── services/
│   │   ├── gemini.ts               # Gemini AI integration
│   │   └── ats-rule-set.md         # ATS guidelines documentation
│   ├── hooks/
│   │   └── useCVData.ts            # Custom hook for CV data management
│   ├── utils/
│   │   ├── exporters.ts            # Export utilities (JSON, MD, LaTeX)
│   │   ├── darkModeClasses.ts      # Dark mode utility classes
│   │   └── editorDarkModeGuide.ts  # Dark mode styling guide
│   ├── types.ts                    # TypeScript type definitions
│   ├── App.tsx                     # Main app component
│   └── main.tsx                    # Entry point
├── public/                         # Static assets
├── index.html                      # HTML template
└── vite.config.ts                  # Vite configuration
```

---

## 🔑 Key Components

### Editor.tsx

Main editor component that manages:

- State management for UI (dialogs, loading states)
- AI operations (text refinement, ATS analysis, PDF parsing)
- File import/export handlers
- ATS history tracking
- Integration with all sub-forms

### Services (gemini.ts)

AI service layer that provides:

- `refineText()`: AI text refinement for professional writing
- `parseResumeFromPdf()`: Extract structured data from PDF with Gemini Vision
- `analyzeATSScore()`: Comprehensive ATS analysis with structured output

### ATSAnalysisArt.tsx

Generative art visualization for ATS results:

- Uses p5.js for dual canvas rendering
- Dynamic color mapping based on score
- Interactive score breakdown
- History navigation

---

## 🎨 Design System

### Color Palette

- **Light Mode**: Gray-100 background, white cards
- **Dark Mode**: Gray-950 background, gray-900 cards
- **Accent Colors**: Indigo for primary actions
- **Status Colors**: Green (success), red (error), yellow (warning)

### Typography

- **Font Options**: Serif, Sans-serif, Monospace
- **Responsive Sizing**: Adaptive for mobile/desktop
- **Print Optimized**: Clean typography for PDF export

### Dark Mode

- System-wide dark mode support
- Persistent theme preference
- Smooth transitions
- Print always uses light theme

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (package manager)

### Environment Variables

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## 🔐 API Integration

### Google Generative AI (Gemini)

- **Model**: gemini-2.5-flash
- **Features Used**:
  - Text generation for content refinement
  - Multimodal input (PDF + text) for resume parsing
  - Structured output with JSON schema
  - Response schema validation

### API Safety

- API key stored in environment variables
- Error handling for API failures
- User consent dialogs for AI operations

---

## 📊 Data Model

### CVData Interface

```typescript
interface CVData {
  header: {
    name: string;
    role: string;
    address: string;
    align: "left" | "center" | "right";
    links: Link[];
  };
  summary: string;
  experience: ExperienceItem[];
  customSections: CustomSection[];
  font: "serif" | "sans" | "mono";
}
```

### Local Storage

- CV data automatically saved to localStorage
- Persistence across sessions
- Import/export for backup

---

## 🎯 User Workflows

### 1. Create New CV

1. Open application → Default template loads
2. Edit header information
3. Update professional summary (optional: use AI refinement)
4. Add work experiences with drag-drop for ordering
5. Add custom sections (Education, Skills, etc.)
6. Preview in real-time on right pane
7. Export or print

### 2. Import Existing Resume

1. Click Import PDF button
2. Accept AI processing consent
3. Select PDF file
4. AI extracts data automatically
5. Review and edit extracted data
6. Continue editing

### 3. ATS Analysis

1. Complete CV data
2. Click "Analyze ATS Score"
3. Accept ATS analysis consent
4. View comprehensive analysis with visual dashboard
5. Review improvements and apply suggestions
6. Re-analyze to track improvements

---

## 🔮 Future Enhancements

Potential improvements that could be added:

- Multiple CV templates/layouts
- Real-time collaboration
- Cloud storage integration
- More export formats (HTML, DOCX)
- AI-powered keyword suggestions
- Job description matching
- Cover letter generator
- Multi-language support
- Version control for CV history

---

## 📝 License & Credits

### Dependencies

- React, TypeScript, Vite (MIT License)
- Tailwind CSS (MIT License)
- Google Generative AI SDK
- PDF.js (Apache 2.0)
- p5.js (LGPL 2.1)

### Development

- Built with modern web technologies
- Follows React & TypeScript best practices
- Responsive & accessible design principles

---

## 🤝 Contributing

This project can be further developed with:

- Bug fixes and improvements
- New features and integrations
- UI/UX enhancements
- Documentation updates
- Testing coverage

---

## 📞 Support

For questions or issues:

- Check code for implementation details
- Review ATS rule-set documentation
- Consult Gemini AI documentation for API usage

---

**Last Updated**: December 2025  
**Version**: 0.0.0
