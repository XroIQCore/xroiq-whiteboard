type ClassifyResult = {
  category: "operating_system" | "framework" | "design" | "task" | "note" | "junk";
  subBucket: string;
  confidence: number;
};

const baseUrl = (process.env.LLM_URL || process.env.LLM_SERVER_URL || "").replace(/\/$/, "");

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

function embeddingFrom(payload: unknown) {
  if (Array.isArray(payload) && payload.every((value) => typeof value === "number")) return payload;
  if (payload && typeof payload === "object") {
    const object = payload as { embedding?: unknown; data?: Array<{ embedding?: unknown }> };
    if (Array.isArray(object.embedding) && object.embedding.every((value) => typeof value === "number")) return object.embedding;
    const first = object.data?.[0]?.embedding;
    if (Array.isArray(first) && first.every((value) => typeof value === "number")) return first;
  }
  return null;
}

function parseJsonObject<T>(text: string): Partial<T> | null {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  try {
    return JSON.parse(cleaned) as Partial<T>;
  } catch {
    return null;
  }
}

export async function embedText(text: string) {
  const custom = embeddingFrom(await postJson<unknown>("/embed", { text }));
  if (custom?.length === 384) return custom;

  const llama = embeddingFrom(await postJson<unknown>("/embedding", { content: text }));
  if (llama?.length === 384) return llama;

  const openAiShape = embeddingFrom(await postJson<unknown>("/v1/embeddings", { input: text }));
  return openAiShape?.length === 384 ? openAiShape : null;
}

export async function classifyText(text: string): Promise<ClassifyResult> {
  const result = await postJson<Partial<ClassifyResult>>("/classify", { text });
  const generated = result || parseJsonObject<ClassifyResult>(
    await completeText(
      [
        "Return only JSON with keys category, subBucket, confidence.",
        "category must be one of operating_system, framework, design, task, note, junk.",
        text.slice(0, 4000),
      ].join("\n\n"),
      160,
    ),
  );
  const category = generated?.category || fallbackCategory(text);
  return {
    category,
    subBucket: generated?.subBucket || fallbackSubBucket(category, text),
    confidence: typeof generated?.confidence === "number" ? generated.confidence : 0.5,
  };
}

export async function summariseText(text: string) {
  const result = await postJson<{ summary?: string }>("/summarise", { text });
  if (result?.summary) return result.summary;
  const generated = await completeText(`Summarise in 2-4 concise lines:\n\n${text.slice(0, 6000)}`, 220);
  return generated || text.trim().replace(/\s+/g, " ").slice(0, 600);
}

export async function completeText(prompt: string, maxTokens = 256) {
  const completion = await postJson<{ content?: string }>("/completion", {
    prompt,
    n_predict: maxTokens,
    temperature: 0.2,
  });
  if (completion?.content) return completion.content;

  const chat = await postJson<{ choices?: Array<{ message?: { content?: string }; text?: string }> }>("/v1/chat/completions", {
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.2,
  });
  return chat?.choices?.[0]?.message?.content || chat?.choices?.[0]?.text || "";
}

function fallbackCategory(text: string): ClassifyResult["category"] {
  const lower = text.toLowerCase();
  if (/\b(next|react|tailwind|postgres|prisma|worker|api|typescript)\b/.test(lower)) return "framework";
  if (/\b(ui|ux|design|layout|brand|component)\b/.test(lower)) return "design";
  if (/\b(todo|task|fix|ship|review|implement)\b/.test(lower)) return "task";
  if (lower.trim().length < 20) return "junk";
  return "note";
}

function fallbackSubBucket(category: ClassifyResult["category"], text: string) {
  const lower = text.toLowerCase();
  if (category === "framework" && /\b(next|react|tailwind)\b/.test(lower)) return "front-end";
  if (category === "framework" && /\b(api|prisma|postgres|worker)\b/.test(lower)) return "back-end";
  if (category === "design") return "interface";
  if (category === "task") return "implementation";
  return "general";
}
