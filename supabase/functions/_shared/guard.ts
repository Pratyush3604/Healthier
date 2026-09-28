// Shared auth + plan quota guard for the AI-backed edge functions.
// Owner/admin and Pro Max: unlimited. Pro: 100 combined uses per month.
// Free: 1 use per tool per day. Owner-granted bonus uses extend either limit.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type GuardResult = { denied: Response } | { userId: string };

export async function guard(
  req: Request,
  feature: string,
  corsHeaders: Record<string, string>,
  _hourlyLimit = 60,
): Promise<GuardResult> {
  const reject = (message: string, status: number, extra: Record<string, unknown> = {}) => ({
    denied: new Response(JSON.stringify({ error: message, ...extra }), {
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

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const [{ data: roles }, { data: prof }] = await Promise.all([
      admin.from("user_roles").select("role").eq("user_id", userId),
      admin.from("profiles").select("tier, tier_expires_at, bonus_uses").eq("user_id", userId).maybeSingle(),
    ]);
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    const active = !prof?.tier_expires_at || new Date(prof.tier_expires_at).getTime() > Date.now();
    const tier = active ? (prof?.tier ?? "free") : "free";
    const bonus = Number(prof?.bonus_uses ?? 0);

    if (!isAdmin && tier !== "pro_max") {
      if (tier === "pro") {
        const monthStart = new Date();
        monthStart.setUTCDate(1);
        monthStart.setUTCHours(0, 0, 0, 0);
        const { count } = await admin.from("ai_usage").select("id", { count: "exact", head: true })
          .eq("user_id", userId).gte("created_at", monthStart.toISOString());
        if ((count ?? 0) >= 100 + bonus) {
          return reject("You've used all 100 Pro uses this month. Upgrade to Pro Max for unlimited.", 429, { code: "quota" });
        }
      } else {
        const dayStart = new Date();
        dayStart.setUTCHours(0, 0, 0, 0);
        const { count } = await admin.from("ai_usage").select("id", { count: "exact", head: true })
          .eq("user_id", userId).eq("feature", feature).gte("created_at", dayStart.toISOString());
        if ((count ?? 0) >= 1 + bonus) {
          return reject("Free plan: 1 use of this tool per day. Upgrade to Healthier Pro for more.", 429, { code: "quota" });
        }
      }
    }

    await admin.from("ai_usage").insert({ user_id: userId, feature });
  } catch (_e) {
    // Never block a legitimate request because usage logging failed.
  }

  return { userId };
}
