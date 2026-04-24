import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars. Check .env.local.",
    );
  }
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>;
    const v = c[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(c) : v;
  },
});
