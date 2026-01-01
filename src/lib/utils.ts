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
