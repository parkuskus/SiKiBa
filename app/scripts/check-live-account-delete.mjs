import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

function parseEnv(text) {
  return Object.fromEntries(text.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    return match ? [[match[1], match[2].trim().replace(/^['"]|['"]$/g, '')]] : []
  }))
}

const serverEnv = parseEnv(await readFile('../supabase/.env', 'utf8'))
const appEnv = parseEnv(await readFile('.env', 'utf8'))
const projectRef = new URL(serverEnv.SUPABASE_URL).hostname.split('.')[0]
assert.equal(projectRef, 'sepindjvfvzxchesrtct')

const admin = createClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const anon = () => createClient(serverEnv.SUPABASE_URL, appEnv.VITE_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const email = `kritis3-delete-${Date.now()}-${randomBytes(3).toString('hex')}@example.invalid`
const password = randomBytes(32).toString('base64url')
let userId
let cloudDeleteSucceeded = false

async function sqlJson(sql) {
  const path = `../supabase/.temp/kritis3-delete-${process.pid}.sql`
  const cliPath = path.replace('../', '')
  await writeFile(path, sql, 'utf8')
  try {
    const command = `npx supabase db query --linked --output-format json --file ${cliPath}`
    const output = execFileSync('cmd.exe', ['/d', '/s', '/c', command], {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 60_000,
      cwd: '..',
    })
    return JSON.parse(output)
  } finally {
    await rm(path, { force: true })
  }
}

async function removeTestObjects() {
  if (!userId) return
  const bucket = admin.storage.from('profile-avatars')
  const { data, error } = await bucket.list(userId, { limit: 1000 })
  if (!error && data?.length) await bucket.remove(data.filter((item) => item.id !== null).map((item) => `${userId}/${item.name}`))
}

try {
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  assert.ifError(created.error)
  userId = created.data.user.id

  const userClient = anon()
  const login = await userClient.auth.signInWithPassword({ email, password })
  assert.ifError(login.error)
  assert.equal(login.data.user.id, userId)

  const profile = await userClient.from('profiles').insert({ id: userId, nama: 'Uji Hapus Sintetis' })
  assert.ifError(profile.error)
  const screening = await userClient.from('screening_results').insert({
    user_id: userId, tipe: 'uji_hapus_sintetis', skor: 0, kategori: 'HIJAU', detail: { synthetic: true },
  })
  assert.ifError(screening.error)
  const weight = await userClient.from('weight_entries').insert({ user_id: userId, tanggal: '2026-10-19', berat_kg: 50 })
  assert.ifError(weight.error)
  const reminder = await userClient.from('supplement_reminders').insert({ user_id: userId, nama_suplemen: `uji-${userId}`, waktu: '12.00' })
  assert.ifError(reminder.error)

  const avatar = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' })
  const upload = await userClient.storage.from('profile-avatars').upload(`${userId}/live-delete.png`, avatar, { contentType: 'image/png' })
  assert.ifError(upload.error)

  const before = await sqlJson(`select
    (select count(*) from public.profiles where id = '${userId}') as profiles,
    (select count(*) from public.screening_results where user_id = '${userId}') as screenings,
    (select count(*) from public.weight_entries where user_id = '${userId}') as weights,
    (select count(*) from public.supplement_reminders where user_id = '${userId}') as reminders,
    (select confdeltype from pg_constraint where conrelid = 'public.profiles'::regclass and conname = 'profiles_id_fkey') as profile_delete_action,
    (select confdeltype from pg_constraint where conrelid = 'public.screening_results'::regclass and conname = 'screening_results_user_id_fkey') as screening_delete_action;`)
  assert.equal(Number(before.rows[0].profiles), 1)
  assert.equal(Number(before.rows[0].screenings), 1)
  assert.equal(Number(before.rows[0].weights), 1)
  assert.equal(Number(before.rows[0].reminders), 1)
  assert.equal(before.rows[0].profile_delete_action, 'c', 'profiles references Auth with ON DELETE CASCADE')
  assert.equal(before.rows[0].screening_delete_action, 'c', 'screening results reference profiles with ON DELETE CASCADE')

  const deleted = await userClient.functions.invoke('delete-account', { method: 'POST' })
  if (deleted.error) {
    const body = await deleted.error.context?.json().catch(() => ({}))
    throw new Error(`delete-account returned ${deleted.error.context?.status ?? 'unknown'}: ${body?.error ?? 'unknown'}`)
  }
  assert.equal(deleted.data.deleted, 'true')
  cloudDeleteSucceeded = true

  const lookup = await admin.auth.admin.getUserById(userId)
  assert.equal(lookup.data.user, null, 'synthetic Auth user is deleted')
  const after = await sqlJson(`select
    (select count(*) from public.profiles where id = '${userId}') as profiles,
    (select count(*) from public.screening_results where user_id = '${userId}') as screenings,
    (select count(*) from public.weight_entries where user_id = '${userId}') as weights,
    (select count(*) from public.supplement_reminders where user_id = '${userId}') as reminders;`)
  assert.deepEqual(Object.fromEntries(Object.entries(after.rows[0]).map(([key, value]) => [key, Number(value)])), {
    profiles: 0, screenings: 0, weights: 0, reminders: 0,
  })

  const objects = await admin.storage.from('profile-avatars').list(userId, { limit: 100 })
  assert.ifError(objects.error)
  assert.equal(objects.data.length, 0, 'synthetic avatar folder is empty')
  console.log(JSON.stringify({
    project: projectRef,
    disposableSyntheticUserDeleted: true,
    authLookup: 'user_not_found',
    cascadeCounts: after.rows[0],
    avatarObjectsRemaining: 0,
    accountsAandBRetained: true,
  }))
} finally {
  if (userId && !cloudDeleteSucceeded) {
    await removeTestObjects()
    await admin.auth.admin.deleteUser(userId)
  }
}
