import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const sql = await readFile('../supabase/migrations/010_fix_profile_auth_cascade.sql', 'utf8')
assert.match(sql, /drop\s+constraint\s+if\s+exists\s+profiles_id_fkey/i)
assert.match(sql, /foreign\s+key\s*\(\s*id\s*\)\s*references\s+auth\.users\s*\(\s*id\s*\)\s+on\s+delete\s+cascade/i)

console.log('Koreksi cascade profil ke Auth terverifikasi')
