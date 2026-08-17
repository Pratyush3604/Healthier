import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Sign in required" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Sign in required" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: isAdmin, error: roleError } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleError) return json({ error: "Role check failed" }, 500);
    if (!isAdmin) return json({ error: "Admins only" }, 403);

    let body: { action?: string; user_id?: string; role?: string } = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { body = {}; }
    }
    const action = typeof body.action === "string" ? body.action : "list";

    if (action === "delete_user") {
      const targetId = body.user_id;
      if (!targetId || typeof targetId !== "string" || targetId.length > 64) {
        return json({ error: "Invalid user_id" }, 400);
      }
      if (targetId === user.id) return json({ error: "You cannot delete your own account here" }, 400);
      const { error } = await admin.auth.admin.deleteUser(targetId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "set_role" || action === "remove_role") {
      const targetId = body.user_id;
      const role = body.role;
      const allowed = ["admin", "moderator", "user"];
      if (!targetId || typeof targetId !== "string" || !role || !allowed.includes(role)) {
        return json({ error: "Invalid user_id or role" }, 400);
      }
      if (action === "set_role") {
        const { error } = await admin.from("user_roles").upsert(
          { user_id: targetId, role },
          { onConflict: "user_id,role" },
        );
        if (error) return json({ error: error.message }, 400);
      } else {
        const { error } = await admin.from("user_roles").delete().eq("user_id", targetId).eq("role", role);
        if (error) return json({ error: error.message }, 400);
      }
      return json({ ok: true });
    }

    // Default: list every account with its profile and roles.
    const { data: authList, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) return json({ error: listError.message }, 500);

    const { data: profiles } = await admin.from("profiles").select("*");
    const { data: roles } = await admin.from("user_roles").select("user_id, role");

    const profileByUser = new Map((profiles ?? []).map((p: { user_id: string }) => [p.user_id, p]));
    const rolesByUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const list = rolesByUser.get(r.user_id) ?? [];
      list.push(r.role);
      rolesByUser.set(r.user_id, list);
    }

    const users = authList.users.map((u) => {
      const p = (profileByUser.get(u.id) ?? {}) as Record<string, unknown>;
      return {
        id: u.id,
        email: u.email ?? null,
        phone: (p.phone as string | null) ?? u.phone ?? null,
        provider: u.app_metadata?.provider ?? "email",
        email_confirmed: Boolean(u.email_confirmed_at),
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        full_name: (p.full_name as string | null) ?? null,
        gender: (p.gender as string | null) ?? null,
        date_of_birth: (p.date_of_birth as string | null) ?? null,
        height_cm: (p.height_cm as number | null) ?? null,
        weight_kg: (p.weight_kg as number | null) ?? null,
        blood_group: (p.blood_group as string | null) ?? null,
        allergies: (p.allergies as string | null) ?? null,
        chronic_conditions: (p.chronic_conditions as string | null) ?? null,
        medications: (p.medications as string | null) ?? null,
        emergency_contact_name: (p.emergency_contact_name as string | null) ?? null,
        emergency_contact_phone: (p.emergency_contact_phone as string | null) ?? null,
        city: (p.city as string | null) ?? null,
        country: (p.country as string | null) ?? null,
        preferred_language: (p.preferred_language as string | null) ?? null,
        last_seen_at: (p.last_seen_at as string | null) ?? null,
        roles: rolesByUser.get(u.id) ?? [],
      };
    });

    return json({ users, count: users.length });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
