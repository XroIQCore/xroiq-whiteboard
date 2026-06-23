type ClassifyResult = {
  category: "operating_system" | "framework" | "design" | "task" | "note" | "junk";
  subBucket: string;
  confidence: number;
};

const baseUrl = process.env.LLM_SERVER_URL || "";

async function postJson<T>(path: string, body: unknown): Promise<T | null> {
  if (!baseUrl) return null;
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function embedText(text: string) {
  const result = await postJson<{ embedding?: number[] }>("/embed", { text });
  return result?.embedding?.length === 384 ? result.embedding : null;
}

export async function classifyText(text: string): Promise<ClassifyResult> {
  const result = await postJson<Partial<ClassifyResult>>("/classify", { text });
  const category = result?.category || fallbackCategory(text);
  return {
    category,
    subBucket: result?.subBucket || fallbackSubBucket(category, text),
    confidence: typeof result?.confidence === "number" ? result.confidence : 0.5,
  };
}

export async function summariseText(text: string) {
  const result = await postJson<{ summary?: string }>("/summarise", { text });
  return result?.summary || text.trim().replace(/\s+/g, " ").slice(0, 600);
}

function fallbackCategory(text: string): ClassifyResult["category"] {
  const lower = text.toLowerCase();
  if (/\b(next|react|tailwind|supabase|prisma|worker|api|typescript)\b/.test(lower)) return "framework";
  if (/\b(ui|ux|design|layout|brand|component)\b/.test(lower)) return "design";
  if (/\b(todo|task|fix|ship|review|implement)\b/.test(lower)) return "task";
  if (lower.trim().length < 20) return "junk";
  return "note";
}

function fallbackSubBucket(category: ClassifyResult["category"], text: string) {
  const lower = text.toLowerCase();
  if (category === "framework" && /\b(next|react|tailwind)\b/.test(lower)) return "front-end";
  if (category === "framework" && /\b(api|prisma|supabase|worker)\b/.test(lower)) return "back-end";
  if (category === "design") return "interface";
  if (category === "task") return "implementation";
  return "general";
}
