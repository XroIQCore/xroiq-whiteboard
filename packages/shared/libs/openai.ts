import OpenAI from "openai";

const key = process.env.OPENAI_API_KEY || "";

export async function chatCompletion(prompt: string) {
  if (!key) {
    return '{"context":"","intention":"","need":"","title":"","confidence":0.5}';
  }

  const api = new OpenAI({ apiKey: key });
  const res = await api.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 256,
  });

  return res.choices[0]?.message?.content ?? "";
}
