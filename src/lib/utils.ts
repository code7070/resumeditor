import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js",
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export const trackEvent = (eventName: string, params = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, params);
  }
};

export const trackPageView = (path: string) => {
  if (window.gtag && GA_ID) {
    window.gtag("config", GA_ID, {
      page_path: path,
    });
  }
};

// Load Google Analytics
const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS;

export const initGA = () => {
  if (!GA_ID) return;

  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `;

  // Append setelah DOM ready, di akhir body
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.body.appendChild(script1);
      document.body.appendChild(script2);
    });
  } else {
    document.body.appendChild(script1);
    document.body.appendChild(script2);
  }
};

export function ensureHtmlFormat(text: string | null | undefined): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length === 0) return "";

  // Check if it already looks like HTML (starts with a tag)
  // Note: We might want to still process links if it's "mostly" text but just happens to start with something that looks like a tag?
  // But strictly adhering to "if it starts with < it's HTML" is safer to avoid double processing.
  if (trimmed.startsWith("<")) return text;

  // 1. Escape HTML characters to prevent XSS (basic)
  // We do this first so we don't escape the tags we are about to add.
  const escaped = trimmed
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Format Markdown links: [text](url) -> <a href="url" target="_blank" rel="noopener noreferrer">text</a>
  // The regex handles the square brackets and parentheses.
  let withLinks = escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  );

  // 3. Format raw URLs: https://example.com -> <a href="...">...</a>
  // Negative lookbehind (?<!href=") to avoid double-linking URLs already inside the href attribute from step 2.
  // We also check it's not preceded by ">" to avoid linking inside an anchor tag content if we did that (though step 2 puts text content).
  // A simple way is to match http/https that are NOT preceded by `"` or `>`.
  withLinks = withLinks.replace(
    /(?<!["=])\bhttps?:\/\/[^\s<]+[^<.,:;"')\]\s]/g,
    (match) => {
      // Return the link
      return `<a href="${match}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${match}</a>`;
    }
  );

  // 4. Split by newlines and wrap in paragraphs
  return withLinks
    .split(/\n+/)
    .map((line) => `<p>${line}</p>`)
    .join("");
}
