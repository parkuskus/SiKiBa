import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { hasMfaClaim } from "../_shared/emailMfa.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(status: number, body: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response(405, { error: "method_not_allowed" });

  const authorization = request.headers.get("Authorization");
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authorization?.startsWith("Bearer ") || !url || !anonKey || !serviceKey) {
    return response(401, { error: "unauthorized" });
  }

  const token = authorization.slice("Bearer ".length);
  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return response(401, { error: "unauthorized" });
  const { data: { claims }, error: claimsError } = await authClient.auth.getClaims(token);
  if (claimsError || !hasMfaClaim(claims)) return response(403, { error: "mfa_required" });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const bucket = admin.storage.from("profile-avatars");
  const paths: string[] = [];

  async function collect(folder: string) {
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await bucket.list(folder, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
      if (error) throw error;
      for (const item of data) {
        const path = folder ? `${folder}/${item.name}` : item.name;
        if (item.id === null) await collect(path);
        else paths.push(path);
      }
      if (data.length < 100) break;
    }
  }

  try {
    await collect(user.id);
    for (let offset = 0; offset < paths.length; offset += 100) {
      const { error } = await bucket.remove(paths.slice(offset, offset + 100));
      if (error) return response(502, { error: "avatar_cleanup_failed" });
    }
  } catch {
    return response(502, { error: "avatar_cleanup_failed" });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return response(502, { error: "account_delete_failed" });
  return response(200, { deleted: "true" });
});
