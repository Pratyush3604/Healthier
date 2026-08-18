// Shared auth + abuse guard for the AI-backed edge functions.
// Validates the caller's JWT in code and enforces a per-user hourly quota so a
// stolen anon key cannot burn through the project's AI credits.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const HOUR_MS = 60 * 60 * 1000;

export type GuardResult = { denied: Response } | { userId: string };

export async function guard(
  req: Request,
  feature: string,
  corsHeaders: Record<string, string>,
  hourlyLimit = 60,
): Promise<GuardResult> {
  const reject = (message: string, status: number) => ({
    denied: new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }),
  });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return reject("Unauthorized", 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data, error } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !data?.user) return reject("Unauthorized", 401);

  const userId = data.user.id;

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const since = new Date(Date.now() - HOUR_MS).toISOString();
    const { count } = await admin
      .from("ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);

    if ((count ?? 0) >= hourlyLimit) {
      return reject("Hourly limit reached. Please try again later.", 429);
    }

    await admin.from("ai_usage").insert({ user_id: userId, feature });
  } catch (_e) {
    // Never block a legitimate request because usage logging failed.
  }

  return { userId };
}
