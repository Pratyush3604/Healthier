import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "health_info",
  title: "General health information",
  description:
    "Ask Healthier's medical assistant for general, non-emergency health information about a topic, symptom, or medication. Returns educational content only — never a diagnosis or prescription.",
  inputSchema: {
    topic: z.string().trim().min(2).max(500).describe("The health topic or question."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ topic }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { content: [{ type: "text", text: "LOVABLE_API_KEY not configured" }], isError: true };
    }
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are Healthier AI. Provide concise, educational health information (150-250 words). Never diagnose or prescribe. Always advise consulting a doctor for serious concerns. Include a short disclaimer.",
          },
          { role: "user", content: topic },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { content: [{ type: "text", text: `AI error: ${res.status} ${errText}` }], isError: true };
    }
    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    return { content: [{ type: "text", text }], structuredContent: { topic, answer: text } };
  },
});
