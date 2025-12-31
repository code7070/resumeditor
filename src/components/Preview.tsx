import type { CVData } from "../types";
import React from "react";

interface PreviewProps {
  data: CVData;
}

export const Preview = React.forwardRef<HTMLDivElement, PreviewProps>(
  ({ data }, ref) => {
    const headerContainerAlign = (() => {
      if (data.header.align === "center") return "items-center";
      if (data.header.align === "right") return "items-end";
      return "items-start";
    })();

    const subHeaderAlign = (() => {
      if (data.header.align === "center") return "justify-center";
      if (data.header.align === "right") return "justify-end";
      return "justify-start";
    })();

    // Use specific ATS-friendly fonts
    const fontFamily = (() => {
      if (data.font === "sans") return "var(--font-cv-sans)"; // Arial
      if (data.font === "mono") return "var(--font-cv-mono)"; // Courier New
      return "var(--font-cv-serif)"; // Times New Roman
    })();

    return (
      <div
        ref={ref}
        id="cv-preview"
        className="bg-white text-black p-[5mm_5mm] md:p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:p-[12mm] print:max-w-none leading-tight [&_a]:underline"
        style={{ fontFamily, fontSize: "11pt" }}
      >
        {/* Header */}
        <header
          className={`mb-2 pb-3 flex flex-col gap-1 ${headerContainerAlign}`}
        >
          <h1 className="font-bold tracking-tight" style={{ fontSize: "16pt" }}>
            {data.header.name}
          </h1>
          {data.header.role && (
            <div className="font-semibold" style={{ fontSize: "13pt" }}>
              {data.header.role}
            </div>
          )}

          <div
            className={`flex flex-wrap gap-x-2 text-black items-center ${subHeaderAlign}`}
            style={{ fontSize: "10pt" }}
          >
            {data.header.address && (
              <span className="font-medium">{data.header.address}</span>
            )}

            {data.header.address && data.header.links.length > 0 && (
              <span
                className="text-gray-400 select-none"
                style={{ fontSize: "10pt" }}
              >
                |
              </span>
            )}

            {data.header.links.map((link, index) => (
              <div key={link.id} className="flex items-center gap-2">
                {index > 0 && (
                  <span
                    className="text-gray-400 select-none"
                    style={{ fontSize: "10pt" }}
                  >
                    |
                  </span>
                )}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {link.label}
                </a>
              </div>
            ))}
          </div>
        </header>

        {/* Summary */}
        {data.summary && (
          <section className="mb-4">
            <h2
              className="font-bold mb-1.5 border-b border-black/50 pb-0.5"
              style={{ fontSize: "12pt" }}
            >
              SUMMARY
            </h2>
            <div
              className="text-black leading-snug text-justify"
              style={{ fontSize: "11pt" }}
              dangerouslySetInnerHTML={{ __html: data.summary }}
            />
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-4">
            <h2
              className="font-bold mb-2 border-b border-black/50 pb-0.5"
              style={{ fontSize: "12pt" }}
            >
              EXPERIENCE
            </h2>
            <div className="space-y-3">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold" style={{ fontSize: "11pt" }}>
                      {exp.title}
                    </h3>
                    <span
                      className="font-medium whitespace-nowrap"
                      style={{ fontSize: "10pt" }}
                    >
                      {exp.year}
                    </span>
                  </div>
                  <div
                    className="mb-1 italic font-medium"
                    style={{ fontSize: "10pt" }}
                  >
                    {exp.description}
                  </div>
                  {exp.items.length > 0 && (
                    <ul
                      className="list-disc list-outside ml-3 text-black space-y-0.5"
                      style={{ fontSize: "11pt" }}
                    >
                      {exp.items.map((item) => (
                        <li key={item.id} className="pl-0.5">
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-4">
          {/* Custom Sections */}
          {data.customSections.map((section) => (
            <section key={section.id}>
              <h2
                className="font-bold mb-2 border-b border-black/50 pb-0.5"
                style={{ fontSize: "12pt" }}
              >
                {section.name}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold" style={{ fontSize: "11pt" }}>
                        {item.title}
                      </h3>
                      <span
                        className="font-medium whitespace-nowrap"
                        style={{ fontSize: "10pt" }}
                      >
                        {item.year}
                      </span>
                    </div>
                    <div
                      className="text-black leading-snug"
                      style={{ fontSize: "11pt" }}
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }
);

Preview.displayName = "Preview";
