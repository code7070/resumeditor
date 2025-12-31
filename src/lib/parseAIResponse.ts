export interface ArtifactResponse {
  type: "artifact";
  artifact_type:
    | "summary"
    | "experience"
    | "skills"
    | "bullet_points"
    | "additional_section";
  content: string | any; // Can be string or structured object
  metadata?: {
    rationale?: string;
    section_name?: string;
    title?: string;
    year?: string;
  };
}

export interface ChatResponse {
  type: "chat";
  content: string;
}

export type ParsedResponse = ArtifactResponse | ChatResponse;

export function parseAIResponse(rawText: string): ParsedResponse {
  // Try to extract JSON from code block
  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.type === "artifact") {
        return parsed as ArtifactResponse;
      }
    } catch (e) {
      console.warn("Failed to parse artifact JSON", e);
    }
  }

  // Default: treat as chat
  return {
    type: "chat",
    content: rawText,
  };
}
