import { GoogleGenAI } from "@google/genai";
import type { CVData } from "../types";
import ATS_RULE_SET from "./ats-rule-set.md?raw";
import { parseAIResponse, type ParsedResponse } from "@/lib/parseAIResponse";

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

export async function refineText(
  text: string,
  context?: CVData,
  userPrompt?: string
): Promise<string[]> {
  if (!API_KEY) throw new Error("Missing VITE_GEMINI_API_KEY");

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      options: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
    },
    required: ["options"],
  };

  const contextPrompt = context
    ? `\n\nFull CV Context:\n${JSON.stringify(context, null, 2)}`
    : "";

  const additionalInstruction = userPrompt
    ? `\n\nUser Instruction: ${userPrompt}\n(Please follow this instruction strictly while generating the options)`
    : "";

  const systemInstruction = context
    ? `You are an expert CV writer. Create 3 distinct professional summary options based on the provided CV data. Ensure they highlight key achievements and specific skills found in the full context.${additionalInstruction}`
    : `Refine this text to be more professional, concise, and impactful for a CV/Resume. Provide 3 distinct options/variations.${additionalInstruction}`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemInstruction}\n\nCurrent Summary Draft: "${text}"${contextPrompt}`,
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
    const textPart = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textPart) return [text];

    const parsed = JSON.parse(textPart);
    return parsed.options || [text];
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
    
    IMPORTANT for 'header.links':
    - You MUST extract the actual URL/href for every link, not just the visible text.
    - If a text is a hyperlink (e.g. "LinkedIn" or "Portfolio"), extract the underlying URL.
    - For email addresses, include "mailto:" prefix in the url field if not present.
    - For simple text links without hyperlinks, try to reconstruct the URL (e.g. for "github.com/user" -> "https://github.com/user").
    - **CRITICAL FOR LINKEDIN**: If you see the text "LinkedIn" but no direct hyperlink, scan the entire document for a matching LinkedIn URL (e.g. "linkedin.com/in/...") and use that as the URL.
    
    For 'experience.items', split the description into bullet points if possible.
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

export async function chatWithGemini(
  messages: { role: "user" | "model"; content: string }[],
  data: Partial<CVData>,
  selectedContexts: string[]
): Promise<ParsedResponse> {
  if (!API_KEY) throw new Error("Missing VITE_GEMINI_API_KEY");

  let contextParts: string[] = [];

  if (selectedContexts.includes("full")) {
    contextParts.push(`FULL_CV_DATA:\n${JSON.stringify(data, null, 2)}`);
  } else {
    if (selectedContexts.includes("summary")) {
      contextParts.push(`PROFESSIONAL_SUMMARY:\n${data.summary}`);
    }
    if (selectedContexts.includes("experience")) {
      contextParts.push(
        `WORK_EXPERIENCE:\n${JSON.stringify(data.experience, null, 2)}`
      );
    }
    // Custom sections
    data.customSections?.forEach((section) => {
      if (selectedContexts.includes(section.id)) {
        contextParts.push(
          `SECTION_${section.name.toUpperCase()}:\n${JSON.stringify(
            section.items,
            null,
            2
          )}`
        );
      }
    });
  }

  const specificContext = contextParts.join("\n\n---\n\n");

  // const systemPrompt = `
  //   You are a concise CV optimization expert. Analyze the provided CV context and give SHORT, ACTIONABLE advice.

  //   SELECTED_CONTEXTS: ${selectedContexts.join(", ")}
  //   CONTEXT_DATA:
  //   ${specificContext}

  //   RULES:
  //   - Keep responses brief and to-the-point (2-4 sentences max unless asked for details)
  //   - Use bullet points for multiple suggestions
  //   - Focus on actionable improvements, not general praise
  //   - Prioritize impact: what changes will make the biggest difference?
  //   - Use markdown formatting for clarity
  //   - If suggesting changes, explain WHY in one sentence
  // `;
  const systemPrompt = `
      You are a CV optimization expert. Return responses in one of two formats:

      **FORMAT 1 - CHAT** (for advice/questions):
      Just return plain markdown text.

      **FORMAT 2 - ARTIFACT** (for generating CV content):
      When user asks to create/generate/write content, respond with JSON wrapped in code block.
      
      ARTIFACT TYPES AND STRUCTURES:

      1. **summary** - Plain text summary
      \`\`\`json
      {
        "type": "artifact",
        "artifact_type": "summary",
        "content": "Professional summary text here...",
        "metadata": { "rationale": "why this works" }
      }
      \`\`\`

      2. **experience** - Can be string OR structured object
      String format:
      \`\`\`json
      {
        "type": "artifact",
        "artifact_type": "experience",
        "content": "Job Title at Company\\nDescription of role...",
        "metadata": { "rationale": "why this works" }
      }
      \`\`\`
      
      Object format (preferred):
      \`\`\`json
      {
        "type": "artifact",
        "artifact_type": "experience",
        "content": {
          "title": "Senior Developer at Tech Corp",
          "year": "2020 - Present",
          "description": "Leading frontend development...",
          "items": []
        },
        "metadata": { "rationale": "why this works" }
      }
      \`\`\`

      3. **skills** - MUST use object with items array for multiple skills
      \`\`\`json
      {
        "type": "artifact",
        "artifact_type": "skills",
        "content": {
          "items": [
            {
              "title": "Programming Languages",
              "description": "JavaScript, TypeScript, Python, Go",
              "year": ""
            },
            {
              "title": "Frameworks & Libraries",
              "description": "React, Next.js, Node.js, Express",
              "year": ""
            }
          ]
        },
        "metadata": { "rationale": "why this works" }
      }
      \`\`\`

      4. **additional_section** - For Education, Languages, etc. MUST use object with items array
      \`\`\`json
      {
        "type": "artifact",
        "artifact_type": "additional_section",
        "content": {
          "name": "Education",
          "items": [
            {
              "title": "BS Computer Science",
              "description": "University of Technology",
              "year": "2016-2020"
            },
            {
              "title": "MS Software Engineering",
              "description": "Tech Institute",
              "year": "2020-2022"
            }
          ]
        },
        "metadata": {
          "section_name": "Education",
          "rationale": "why this works"
        }
      }
      \`\`\`

      5. **bullet_points** - For adding to existing experience
      \`\`\`json
      {
        "type": "artifact",
        "artifact_type": "bullet_points",
        "content": "- Improved performance by 40%\\n- Led team of 5 developers\\n- Architected new system",
        "metadata": { "rationale": "why this works" }
      }
      \`\`\`

      CRITICAL RULES:
      - For skills and additional_section: ALWAYS use object format with items array
      - Each item in items array MUST have: title, description, year
      - Description should be plain text (will be converted to HTML automatically)
      - For additional_section: include section_name in metadata AND content.name
      - Keep descriptions concise and professional

      Use ARTIFACT when user says: "buatkan", "generate", "create", "tulis", "write"

      SELECTED_CONTEXTS: ${selectedContexts.join(", ")}
      CONTEXT_DATA:
      ${specificContext}

      RULES:
      - Keep chat responses brief (2-4 sentences max unless asked for details)
      - For artifacts, write professional CV content ready to use
      - Use markdown formatting for clarity
      - Always return properly structured JSON for artifacts
      `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I'm ready to help you with your CV based on the context provided. How can I assist you today?",
            },
          ],
        },
        ...messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
      ],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response");
    return parseAIResponse(text);
  } catch (e) {
    console.error("Gemini Chat Error:", e);
    throw e;
  }
}
