import OpenAI from "openai";
import { completeText } from "./llm";

const key = process.env.OPENAI_API_KEY || "";

export async function chatCompletion(prompt: string) {
  const local = await completeText(prompt);
  if (local) return local;

  if (!key) {
    throw new Error("LLM_URL or OPENAI_API_KEY is required for chat completion");
  }

  const api = new OpenAI({ apiKey: key });
  const res = await api.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 256,
  });

  return res.choices[0]?.message?.content ?? "";
}
