import { supabase } from '@/integrations/supabase/client';

/**
 * The AI edge functions identify the caller from their signed-in session.
 * Sending the public key instead made every request fail, so all AI calls
 * must go through these helpers.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

export const QUOTA_EVENT = 'healthier:quota';
export const SIGNIN_EVENT = 'healthier:signin-required';

/**
 * Turns the server's plan/sign-in responses into friendly in-app prompts.
 * Returns true when the response was handled and the caller should stop.
 */
export async function handleLimitResponse(res: Response): Promise<boolean> {
  if (res.status === 429) {
    let message = 'You have reached your plan limit for now.';
    try {
      const body = await res.clone().json();
      if (body?.error) message = String(body.error);
    } catch {
      /* keep the default message */
    }
    window.dispatchEvent(new CustomEvent(QUOTA_EVENT, { detail: { message } }));
    return true;
  }
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent(SIGNIN_EVENT));
    return true;
  }
  return false;
}
