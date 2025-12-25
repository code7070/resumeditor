import type { CVData } from "../types";

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
