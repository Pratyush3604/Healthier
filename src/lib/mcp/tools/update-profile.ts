import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "update_profile",
  title: "Update my profile",
  description: "Update the signed-in Healthier user's display name or avatar URL.",
  inputSchema: {
    full_name: z.string().trim().min(1).max(120).optional().describe("New display name."),
    avatar_url: z.string().url().optional().describe("New avatar image URL."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  handler: async ({ full_name, avatar_url }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (!full_name && !avatar_url) {
      return { content: [{ type: "text", text: "Provide full_name or avatar_url." }], isError: true };
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const patch: Record<string, string> = {};
    if (full_name) patch.full_name = full_name;
    if (avatar_url) patch.avatar_url = avatar_url;
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("user_id", ctx.getUserId())
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { profile: data },
    };
  },
});
