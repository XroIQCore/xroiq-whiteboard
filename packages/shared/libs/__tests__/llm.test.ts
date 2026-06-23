const categories = new Set(["operating_system", "framework", "design", "task", "note", "junk"]);

test("classifyText returns an enum category from the classify endpoint", async () => {
  process.env.LLM_URL = "http://llm:8000";
  jest.resetModules();
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => ({ category: "framework", subBucket: "back-end", confidence: 0.9 }),
  })) as jest.Mock;
  const { classifyText } = await import("../llm");

  const result = await classifyText("Prisma worker writes vectors to Supabase.");

  expect(categories.has(result.category)).toBe(true);
  expect(global.fetch).toHaveBeenCalledWith("http://llm:8000/classify", expect.any(Object));
});
