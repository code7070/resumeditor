import type { CVData } from "../types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
  ExternalHyperlink,
} from "docx";
import { saveAs } from "file-saver";

export async function generateDocx(data: CVData): Promise<void> {
  const children: Paragraph[] = [];

  // Header — Name
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: data.header.name, bold: true, size: 32 }),
      ],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
  );

  // Header — Role
  if (data.header.role) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: data.header.role, size: 24, color: "666666" }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    );
  }

  // Header — Address
  if (data.header.address) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: data.header.address, size: 20, color: "888888" }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    );
  }

  // Header — Links
  if (data.header.links.length > 0) {
    children.push(
      new Paragraph({
        children: data.header.links.flatMap((link, i) => [
          ...(i > 0
            ? [new TextRun({ text: "  |  ", size: 20, color: "888888" })]
            : []),
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: link.label || link.url,
                style: "Hyperlink",
                size: 20,
              }),
            ],
            link: link.url,
          }),
        ]),
        alignment: AlignmentType.CENTER,
      }),
    );
  }

  // Blank line
  children.push(new Paragraph({}));

  // Summary
  if (data.summary) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Summary", bold: true, size: 26 })],
        heading: HeadingLevel.HEADING_2,
      }),
    );
    // Strip HTML tags for plain text
    const plainSummary = data.summary.replace(/<[^>]+>/g, "");
    children.push(
      new Paragraph({
        children: [new TextRun({ text: plainSummary, size: 22 })],
      }),
    );
    children.push(new Paragraph({}));
  }

  // Experience
  if (data.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Experience", bold: true, size: 26 })],
        heading: HeadingLevel.HEADING_2,
      }),
    );
    for (const exp of data.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 22 }),
            new TextRun({ text: `  ${exp.year}`, italics: true, size: 22, color: "888888" }),
          ],
        }),
      );
      if (exp.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.description, italics: true, size: 22 }),
            ],
          }),
        );
      }
      for (const item of exp.items) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item.text, size: 22 })],
            bullet: { level: 0 },
          }),
        );
      }
      children.push(new Paragraph({}));
    }
  }

  // Custom Sections
  for (const section of data.customSections) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: section.name, bold: true, size: 26 }),
        ],
        heading: HeadingLevel.HEADING_2,
      }),
    );
    for (const item of section.items) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: item.title, bold: true, size: 22 }),
            new TextRun({ text: `  ${item.year}`, italics: true, size: 22, color: "888888" }),
          ],
        }),
      );
      if (item.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item.description, size: 22 })],
          }),
        );
      }
    }
    children.push(new Paragraph({}));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(
    blob,
    `resume-${(data.header.name || "cv").replace(/\s+/g, "-").toLowerCase()}.docx`,
  );
}

export function generateMarkdown(data: CVData): string {
  let md = `# ${data.header.name}\n\n`;
  md += `**${data.header.role}**\n\n`;

  if (data.header.address) md += `${data.header.address}\n\n`;

  if (data.header.links.length > 0) {
    md +=
      data.header.links.map((l) => `[${l.label}](${l.url})`).join(" | ") +
      "\n\n";
  }

  if (data.summary) {
    md += `## Summary\n\n${data.summary}\n\n`;
  }

  if (data.experience.length > 0) {
    md += `## Experience\n\n`;
    data.experience.forEach((exp) => {
      md += `### ${exp.title}\n`;
      md += `*${exp.year}*\n\n`;
      md += `_${exp.description}_\n\n`;
      exp.items.forEach((item) => {
        md += `- ${item.text}\n`;
      });
      md += "\n";
    });
  }

  data.customSections.forEach((section) => {
    md += `## ${section.name}\n\n`;
    section.items.forEach((item) => {
      md += `### ${item.title}\n`;
      md += `*${item.year}*\n\n`;
      md += `${item.description}\n\n`;
    });
  });

  return md;
}

export function generateLatex(data: CVData): string {
  // A simple LaTeX template
  let tex = `\\documentclass[a4paper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\title{${escapeLatex(data.header.name)}}
\\author{}
\\date{}

\\begin{document}

\\begin{center}
    {\\Huge \\textbf{${escapeLatex(data.header.name)}}} \\\\[0.5em]
    {\\Large ${escapeLatex(data.header.role)}} \\\\[0.5em]
    ${data.header.address ? escapeLatex(data.header.address) + " \\\\" : ""}
    ${data.header.links
      .map((l) => `\\href{${l.url}}{${escapeLatex(l.label)}}`)
      .join(" $\\cdot$ ")}
\\end{center}

`;

  if (data.summary) {
    tex += `\\section*{Summary}
${escapeLatex(data.summary)}

`;
  }

  if (data.experience.length > 0) {
    tex += `\\section*{Experience}
\\begin{itemize}[leftmargin=*]
`;
    data.experience.forEach((exp) => {
      tex += `    \\item \\textbf{${escapeLatex(
        exp.title
      )}} \\hfill ${escapeLatex(exp.year)} \\\\
    \\textit{${escapeLatex(exp.description)}}
    \\begin{itemize}
`;
      exp.items.forEach((item) => {
        tex += `        \\item ${escapeLatex(item.text)}
`;
      });
      tex += `    \\end{itemize}
`;
    });
    tex += `\\end{itemize}

`;
  }

  data.customSections.forEach((section) => {
    tex += `\\section*{${escapeLatex(section.name)}}
\\begin{itemize}[leftmargin=*]
`;
    section.items.forEach((item) => {
      tex += `    \\item \\textbf{${escapeLatex(
        item.title
      )}} \\hfill ${escapeLatex(item.year)} \\\\
    ${escapeLatex(item.description)}
`;
    });
    tex += `\\end{itemize}

`;
  });

  tex += `\\end{document}`;
  return tex;
}

function escapeLatex(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Convert any color string to RGB format using Canvas 2D context.
 * This utilizes the browser's internal color parsing.
 */
function colorToRGB(color: string): string {
  if (
    !color ||
    color === "transparent" ||
    color === "rgba(0, 0, 0, 0)" ||
    color === "none" ||
    color === "currentColor"
  ) {
    return color;
  }

  // If already RGB/RGBA/HEX, return as is (optimization)
  if (color.startsWith("rgb") || color.startsWith("#")) {
    return color;
  }

  // Use canvas to normalize
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return color;

  // Save current fillStyle
  const oldFill = ctx.fillStyle;

  try {
    ctx.fillStyle = color;
    // If the browser couldn't parse it, it won't change the fillStyle (usually)
    // or it keeps the default (black).
    // We check if it actually accepted the value.
    if (ctx.fillStyle === oldFill && color !== "#000000" && color !== "black") {
      // It might be invalid or not supported by this context, return original
      return color;
    }
    return ctx.fillStyle;
  } catch (e) {
    return color;
  }
}

/**
 * Replace all instances of oklch/oklab functions in a string with their RGB approximations.
 * Useful for complex properties like box-shadow.
 */
function normalizeComplexProperty(value: string): string {
  if (!value || (!value.includes("oklch") && !value.includes("oklab"))) {
    return value;
  }

  // Regex to match oklch(...) or oklab(...)
  // This is a basic matcher; nested parenthesis might trip it up but standard Tailwind output is usually flat.
  return value.replace(/(oklch|oklab)\([^)]+\)/g, (match) => {
    return colorToRGB(match);
  });
}

/**
 * @deprecated Legacy export function using html2canvas + jsPDF.
 * Retained for reference or fallback usage.
 */
export async function exportToPDF_legacy(
  element: HTMLElement,
  filename: string = `resume-${Date.now()}.pdf`
): Promise<void> {
  try {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Create a temporary off-screen container
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = element.offsetWidth + "px";
    // Ensure the container itself doesn't impose weird constraints
    container.style.height = "auto";
    container.style.overflow = "visible";
    container.style.zIndex = "-1";
    document.body.appendChild(container);
    container.appendChild(clone);

    // List of properties to check for color values
    const simpleColorProps = [
      "color",
      "backgroundColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "outlineColor",
      "textDecorationColor",
      "columnRuleColor",
      "fill",
      "stroke",
    ];

    const complexColorProps = ["boxShadow", "textShadow"];

    // Recursive function to normalize colors
    const normalizeColors = (el: Element) => {
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        const computed = window.getComputedStyle(el);

        // Handle simple color properties
        simpleColorProps.forEach((prop) => {
          const val = computed.getPropertyValue(
            prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
          );
          if (val && (val.includes("oklch") || val.includes("oklab"))) {
            el.style.setProperty(prop, colorToRGB(val), "important");
          }
        });

        // Handle complex properties (shadows)
        complexColorProps.forEach((prop) => {
          // We use the camelCase prop name for style object access if needed,
          // but getPropertyValue expects kebab-case
          const kebabProp = prop.replace(
            /[A-Z]/g,
            (m) => `-${m.toLowerCase()}`
          );
          const val = computed.getPropertyValue(kebabProp);
          if (val && (val.includes("oklch") || val.includes("oklab"))) {
            el.style.setProperty(
              kebabProp,
              normalizeComplexProperty(val),
              "important"
            );
          }
        });
      }

      // Recursively process children
      Array.from(el.children).forEach(normalizeColors);
    };

    // Apply normalization
    normalizeColors(clone);

    // Small delay to ensure styles are applied and rendered
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Capture the element as a canvas
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false, // Disable built-in logging to reduce noise
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      ignoreElements: (el) => el.classList?.contains("print:hidden"),
      onclone: (_clonedDoc) => {
        // Failsafe: if there are any remaining style tags injecting global styles,
        // we arguably can't easily clean them here without parsing CSS.
        // But our element-level overrides should take precedence.
      },
    });

    // Clean up
    document.body.removeChild(container);

    // Create PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("Failed to export PDF:", error);
    // Provide a more user-friendly error message if it's the specific oklab error
    if (
      error instanceof Error &&
      (error.message.includes("oklab") || error.message.includes("oklch"))
    ) {
      throw new Error(
        "PDF generation failed due to browser color compatibility. Please try using a different browser (Chrome/Firefox) or printing to PDF (Cmd/Ctrl + P)."
      );
    }
    throw new Error("Failed to generate PDF. Please try again.");
  }
}
