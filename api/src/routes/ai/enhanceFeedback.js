import { Hono } from "hono";

const router = new Hono();

router.post("/", async (c) => {
  const { text } = await c.req.json();
  if (!text || typeof text !== "string") {
    return c.json({ error: "Missing or invalid text" }, 400);
  }
  try {
    const res = await fetch("http://ollama:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `Improve the following feedback for clarity, grammar, and professionalism. Give back only the reply, as if to replace the input\n\n"${text}"`,
        stream: false,
      }),
    });
    if (!res.ok) throw new Error("Ollama error");
    const data = await res.json();
    return c.json({ response: data.response || text });
  } catch (err) {
    return c.json({ error: "AI enhancement failed" }, 500);
  }
});

export default router;
