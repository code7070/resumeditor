import type { CVData } from "../types";

interface PreviewProps {
  data: CVData;
}

export function Preview({ data }: PreviewProps) {
  const headerContainerAlign =
    data.header.align === "center"
      ? "items-center"
      : data.header.align === "right"
      ? "items-end"
      : "items-start";

  // Use specific ATS-friendly fonts
  const fontFamily =
    data.font === "sans"
      ? "var(--font-cv-sans)" // Arial
      : data.font === "mono"
      ? "var(--font-cv-mono)" // Courier New
      : "var(--font-cv-serif)"; // Times New Roman

  return (
    <div
      className="bg-white text-black p-[5mm_5mm] md:p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:p-[12mm] print:max-w-none text-[10pt] leading-tight"
      style={{ fontFamily }}
    >
      {/* Header */}
      <header className={`mb-4 pb-3 flex flex-col ${headerContainerAlign}`}>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          {data.header.name}
        </h1>
        <div className="text-base font-semibold mb-1">{data.header.role}</div>

        <div
          className={`flex flex-wrap gap-x-2 text-xs text-black items-center ${
            data.header.align === "center"
              ? "justify-center"
              : data.header.align === "right"
              ? "justify-end"
              : "justify-start"
          }`}
        >
          {data.header.address && (
            <span className="font-medium">{data.header.address}</span>
          )}

          {data.header.address && data.header.links.length > 0 && (
            <span className="text-gray-400 select-none text-[10px]">|</span>
          )}

          {data.header.links.map((link, index) => (
            <div key={link.id} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-gray-400 select-none text-[10px]">|</span>
              )}
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
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
          <h2 className="text-sm font-bold  mb-1.5 border-b border-black/50 pb-0.5">
            SUMMARY
          </h2>
          <p className="text-black leading-snug text-justify">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold  mb-2 border-b border-black/50 pb-0.5">
            EXPERIENCE
          </h2>
          <div className="space-y-3">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-xs">{exp.title}</h3>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {exp.year}
                  </span>
                </div>
                <div className="mb-1 text-xs italic font-medium">
                  {exp.description}
                </div>
                {exp.items.length > 0 && (
                  <ul className="list-disc list-outside ml-3 text-black space-y-0.5">
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

      {/* Custom Sections */}
      {data.customSections.map((section) => (
        <section key={section.id} className="mb-4">
          <h2 className="text-sm font-bold  mb-2 border-b border-black/50 pb-0.5">
            {section.name}
          </h2>
          <div className="space-y-2">
            {section.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-xs">{item.title}</h3>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {item.year}
                  </span>
                </div>
                <div className="text-black text-xs leading-snug">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
