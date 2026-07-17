import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { HealtifyLogo } from "@/components/HealtifyLogo";

// Minimal typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthClient = { name?: string; client_name?: string; redirect_uri?: string };
type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: any }>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

function isSameOriginPath(p: string | null): p is string {
  return !!p && p.startsWith("/") && !p.startsWith("//");
}

export default function OAuthConsentPage() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        setLoading(false);
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        const target = isSameOriginPath(next) ? next : "/";
        window.location.href = "/auth?next=" + encodeURIComponent(target);
        return;
      }
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message ?? "Could not load authorization request.");
        setLoading(false);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message ?? "Authorization failed.");
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an app";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4"><HealtifyLogo size={56} /></div>
          <h1 className="font-display text-2xl font-bold">Connect to Healthier</h1>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {loading ? (
            <div className="flex items-center gap-3 justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading authorization request…</span>
            </div>
          ) : error ? (
            <div className="text-center space-y-3">
              <p className="text-destructive font-medium">Couldn't load this request</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-4">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    Allow <span className="text-primary">{clientName}</span> to access Healthier as you?
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This lets {clientName} call Healthier tools while you are signed in — read your profile, update it, and ask general health questions. It does not bypass Healthier's permissions.
                  </p>
                </div>
              </div>

              {details?.scope && (
                <p className="text-xs text-muted-foreground mb-4">
                  Requested scope: <code className="bg-muted px-1 py-0.5 rounded">{details.scope}</code>
                </p>
              )}

              <div className="flex gap-3">
                <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                </Button>
                <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
                  <X className="h-4 w-4 mr-2" /> Deny
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Healthier is not for emergencies. Always consult a professional for serious concerns.
        </p>
      </div>
    </div>
  );
}
