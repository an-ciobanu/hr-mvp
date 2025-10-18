// Call Ollama server to enhance feedback text
export async function enhanceFeedbackWithAI(text) {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${baseUrl}/api/ai/enhance-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("AI enhancement failed");
  const data = await res.json();
  return data.response || text;
}
