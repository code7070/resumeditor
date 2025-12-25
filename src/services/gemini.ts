import { GoogleGenAI } from "@google/genai";
import type { CVData } from "../types";
import ATS_RULE_SET from "./ats-rule-set.md?raw";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const client = new GoogleGenAI({ apiKey: API_KEY });

// Define SchemaType locally as const map to avoid import errors
const SchemaType = {
  STRING: "STRING",
  NUMBER: "NUMBER",
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  ARRAY: "ARRAY",
  OBJECT: "OBJECT",
} as const;

export async function refineText(text: string): Promise<string> {
  if (!API_KEY) throw new Error("Missing VITE_GEMINI_API_KEY");

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Refine this text to be more professional, concise, and impactful for a CV/Resume:\n\n"${text}"`,
            },
          ],
        },
      ],
    });

    // @ts-ignore
    const textPart = response.candidates?.[0]?.content?.parts?.[0]?.text;
    return textPart || text;
  } catch (e) {
    console.error("Gemini Refine Error:", e);
    throw e;
  }
}

export async function parseResumeFromPdf(
  base64Data: string,
  mimeType: string = "application/pdf"
): Promise<Partial<CVData>> {
  if (!API_KEY) throw new Error("Missing VITE_GEMINI_API_KEY");

  // Define the schema strictly matching CVData
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      header: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          role: { type: SchemaType.STRING },
          address: { type: SchemaType.STRING },
          align: { type: SchemaType.STRING, enum: ["left", "center", "right"] },
          links: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                label: { type: SchemaType.STRING },
                url: { type: SchemaType.STRING },
              },
              required: ["id", "label", "url"],
            },
          },
        },
        required: ["name", "role", "links"],
      },
      summary: { type: SchemaType.STRING },
      experience: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            title: { type: SchemaType.STRING },
            year: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING },
                  text: { type: SchemaType.STRING },
                },
                required: ["id", "text"],
              },
            },
          },
          required: ["id", "title", "year", "description", "items"],
        },
      },
      customSections: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            name: { type: SchemaType.STRING },
            items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING },
                  title: { type: SchemaType.STRING },
                  year: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                },
                required: ["id", "title", "year", "description"],
              },
            },
          },
          required: ["id", "name", "items"],
        },
      },
    },
    required: ["header", "summary", "experience", "customSections"],
  };

  const prompt = `
    Extract resume data from the file provided.
    Ensure the output strictly adheres to the JSON schema provided.
    For 'experience.items', split the description into bullet points if possible.
    For 'header.links', extract email, linkedin, etc.
    If a field is missing, use an empty string or empty array.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // @ts-ignore
    const textNode = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textNode) throw new Error("No response from Gemini");

    return JSON.parse(textNode);
  } catch (e) {
    console.error("Gemini Parse Error:", e);
    throw e;
  }
}
export interface ATSAnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  formattingFeedback: string[];
}

export async function analyzeATSScore(
  cvData: CVData
): Promise<ATSAnalysisResult> {
  if (!API_KEY) throw new Error("Missing VITE_GEMINI_API_KEY");

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      score: { type: SchemaType.NUMBER },
      strengths: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      improvements: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      missingKeywords: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      formattingFeedback: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
    },
    required: [
      "score",
      "strengths",
      "improvements",
      "missingKeywords",
      "formattingFeedback",
    ],
  };

  const prompt = `
    You are an expert ATS (Applicant Tracking System) analyzer.
    Evaluate the following CV data against the provided ATS Rule-Set.
    
    ATS Rule-Set:
    ${ATS_RULE_SET}

    CV Data:
    ${JSON.stringify(cvData, null, 2)}

    Analyze the CV and provide:
    1. A score from 0 to 100.
    2. A list of strengths.
    3. A list of improvements/weaknesses.
    4. Important keywords that might be missing (general professional ones if no job desc).
    5. Formatting feedback based on the rule-set.

    Ensure the response strictly adheres to the JSON schema.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // @ts-ignore
    const textNode = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textNode) throw new Error("No response from Gemini");

    return JSON.parse(textNode);
  } catch (e) {
    console.error("Gemini ATS Analysis Error:", e);
    throw e;
  }
}
