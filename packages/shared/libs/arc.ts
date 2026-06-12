export type ArcSummary = {
  title?: string;
  summary?: string;
  confidence?: number;
};

export function keywordSet(text: string) {
  const ignored = new Set(["the", "and", "for", "with", "that", "this", "from", "into", "need", "intent", "context"]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 4 && !ignored.has(word))
      .slice(0, 20),
  );
}

export function overlaps(a: Set<string>, b: Set<string>) {
  for (const word of a) {
    if (b.has(word)) return true;
  }
  return false;
}

export function parseArcSummary(raw: string): ArcSummary {
  const trimmed = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    return { title: "Untitled arc", summary: raw.slice(0, 1000), confidence: 0.5 };
  }
}
