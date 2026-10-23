import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error("Set local SUPABASE_URL and SUPABASE_ANON_KEY first");
if (!['127.0.0.1', 'localhost'].includes(new URL(url).hostname)) throw new Error("This check only runs against local Supabase");

const psql = process.env.PSQL_PATH ?? "psql";
const email = `auth-password-${randomUUID()}@local.test`;
const password = `Synthetic-${randomUUID()}!`;
let userId;

function runSql(sql) {
  const result = spawnSync(psql, [
    "-h", "127.0.0.1", "-p", "55322", "-U", "postgres", "-d", "postgres",
    "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-f", "-",
  ], { encoding: "utf8", input: sql, env: { ...process.env, PGPASSWORD: "postgres" } });
  if (result.status !== 0) throw new Error("Local Auth database assertion failed");
  return result.stdout.trim();
}

try {
  const signup = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const created = await signup.json();
  if (!signup.ok || !created.user?.id) throw new Error("Local Auth could not create synthetic account");
  if (!/^[0-9a-f-]{36}$/i.test(created.user.id)) throw new Error("Local Auth returned an invalid synthetic user ID");
  userId = created.user.id;

  runSql(`update auth.users set email_confirmed_at = now() where id = '${userId}'`);
  const hashMatches = runSql(
    `select (encrypted_password <> '${password}') and crypt('${password}', encrypted_password) = encrypted_password from auth.users where id = '${userId}'`,
  );
  if (hashMatches !== "t") throw new Error("Auth password hash assertion failed");

  const goodLogin = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!goodLogin.ok) throw new Error("Auth rejected the synthetic account's correct password");
  const loginSession = await goodLogin.json();
  const claims = JSON.parse(Buffer.from(loginSession.access_token.split(".")[1], "base64url").toString("utf8"));
  if (claims.app_mfa_verified === true) throw new Error("Password-only Auth session unexpectedly received the MFA claim");
  if (!claims.amr?.some((method) => (typeof method === "string" ? method : method.method) === "password")) {
    throw new Error("Auth password session did not include the expected signed password method");
  }

  const wrongLogin = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: `${password}-wrong` }),
  });
  if (wrongLogin.ok) throw new Error("Auth accepted an incorrect password");

  console.log("Local Supabase Auth password hashing and verification passed");
} finally {
  if (userId) runSql(`delete from auth.users where id = '${userId}'`);
}
