import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

function parseEnv(text) {
  return Object.fromEntries(text.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    return match ? [[match[1], match[2].trim().replace(/^['"]|['"]$/g, '')]] : []
  }))
}

const serverEnv = parseEnv(await readFile('../supabase/.env', 'utf8'))
const appEnv = parseEnv(await readFile('.env', 'utf8'))
const migrationPaths = [
  '../supabase/migrations/001_init_siaga_bunda.sql',
  '../supabase/migrations/002_chat_rag.sql',
  '../supabase/migrations/007_avatar_push_reminders.sql',
  '../supabase/migrations/009_birth_plans.sql',
]
const migrations = (await Promise.all(migrationPaths.map((path) => readFile(path, 'utf8')))).join('\n')
const policies = [
  ['profiles', 'id', 'own_profiles'],
  ['screening_results', 'user_id', 'own_screening'],
  ['weight_entries', 'user_id', 'own_weight'],
  ['supplement_reminders', 'user_id', 'own_supplement'],
  ['anc_visits', 'user_id', 'own_anc'],
  ['diary_entries', 'user_id', 'own_diary'],
  ['nifas_screenings', 'user_id', 'own_nifas'],
  ['bbl_profiles', 'user_id', 'own_bbl'],
  ['chat_messages', 'user_id', 'own_chat'],
  ['push_subscriptions', 'user_id', 'own_push_subscriptions'],
  ['dose_logs', 'user_id', 'own_dose_logs'],
  ['birth_plans', 'user_id', 'own_birth_plans'],
]
for (const [table, ownerColumn, policy] of policies) {
  assert.ok(new RegExp(`create\\s+policy\\s+"${policy}"\\s+on\\s+(public\\.)?${table}\\s+for\\s+all`, 'i').test(migrations), `${table} owner policy exists`)
  assert.ok(new RegExp(`using\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*${ownerColumn}\\s*\\)\\s+with\\s+check\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*${ownerColumn}\\s*\\)`, 'i').test(migrations), `${table} uses owner-bound USING and WITH CHECK`)
}

const projectRef = new URL(serverEnv.SUPABASE_URL).hostname.split('.')[0]
assert.equal(projectRef, 'sepindjvfvzxchesrtct', 'target must be the configured test project')
const account = (letter) => ({
  id: serverEnv[`SIAGA_TEST_USER_ID_${letter}`],
  email: serverEnv[`SIAGA_TEST_EMAIL_${letter}`],
  password: serverEnv[`SIAGA_TEST_PASSWORD_${letter}`],
})
const a = account('A')
const b = account('B')
assert.ok(a.id && a.email && a.password && b.id && b.email && b.password, 'both local test accounts are configured')
assert.notEqual(a.id, b.id, 'A and B must be different users')
assert.notEqual(a.email, 'dummy@siagabunda.test')
assert.notEqual(b.email, 'dummy@siagabunda.test')

const clientFor = async ({ email, password }) => {
  const client = createClient(serverEnv.SUPABASE_URL, appEnv.VITE_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  assert.ifError(error)
  assert.ok(data.session, 'fresh authenticated session exists')
  return client
}
const clientA = await clientFor(a)
const clientB = await clientFor(b)
const marker = `kritis3-${randomUUID()}`
const today = new Date().toISOString().slice(0, 10)
const cleanup = []
const outcomes = []

async function rejectForgedInsert(table, row) {
  const { error } = await clientB.from(table).insert(row)
  assert.equal(error?.code, '42501', `${table}: B cannot insert data owned by A`)
  outcomes.push(`${table}: forged insert denied`)
}

try {
  const profileFromB = await clientB.from('profiles').select('id').eq('id', a.id)
  assert.ifError(profileFromB.error)
  assert.equal(profileFromB.data.length, 0, 'B cannot read A profile')
  const profileUpdateFromB = await clientB.from('profiles').update({ nama: 'DILARANG' }).eq('id', a.id).select('id')
  assert.ifError(profileUpdateFromB.error)
  assert.equal(profileUpdateFromB.data.length, 0, 'B cannot update A profile')
  const profileA = await clientA.from('profiles').select('nama').eq('id', a.id).single()
  assert.ifError(profileA.error)
  assert.equal(profileA.data.nama, 'Akun Uji Kritis 3 A', 'B did not mutate A profile')
  outcomes.push('profiles: cross-account read/update denied')

  await rejectForgedInsert('profiles', { id: a.id, nama: `forged-${marker}`, email: `forged-${marker}@example.invalid` })
  await rejectForgedInsert('screening_results', { user_id: a.id, tipe: marker, skor: 0, kategori: 'HIJAU', detail: { marker } })
  await rejectForgedInsert('weight_entries', { user_id: a.id, tanggal: today, berat_kg: 42 })
  await rejectForgedInsert('supplement_reminders', { user_id: a.id, nama_suplemen: `${marker}-forged` })
  await rejectForgedInsert('anc_visits', { user_id: a.id, tanggal_terjadwal: today })
  await rejectForgedInsert('diary_entries', { user_id: a.id, tanggal: today, teks: marker, mood: 3 })
  await rejectForgedInsert('nifas_screenings', { user_id: a.id, hari_ke: 0, parameter_vital: { marker }, status: 'HIJAU' })
  await rejectForgedInsert('bbl_profiles', { user_id: a.id, data_lahir: today })
  await rejectForgedInsert('chat_messages', { user_id: a.id, role: 'user', content: marker })
  await rejectForgedInsert('push_subscriptions', { user_id: a.id, endpoint: `https://example.invalid/${marker}`, p256dh: 'synthetic', auth: 'synthetic' })
  await rejectForgedInsert('dose_logs', { user_id: a.id, suplemen_id: `${marker}-forged`, tanggal: today, waktu: '23:57', status: 'none' })
  await rejectForgedInsert('birth_plans', { user_id: a.id, penolong: marker })

  const cases = [
    { table: 'dose_logs', row: { user_id: a.id, suplemen_id: `${marker}-dose`, tanggal: today, waktu: '23:58', status: 'none' }, filters: [['user_id', a.id], ['suplemen_id', `${marker}-dose`]], update: { status: 'taken' } },
    { table: 'supplement_reminders', row: { user_id: a.id, nama_suplemen: `${marker}-supp`, waktu: '23:58' }, filters: [['user_id', a.id], ['nama_suplemen', `${marker}-supp`]], update: { waktu: '00:01' } },
    { table: 'anc_visits', row: { user_id: a.id, tanggal_terjadwal: today, catatan: marker }, filters: null, update: { catatan: `${marker}-changed` } },
    { table: 'push_subscriptions', row: { user_id: a.id, endpoint: `https://example.invalid/${marker}/push`, p256dh: 'synthetic', auth: 'synthetic' }, filters: null, update: { user_agent: marker } },
    { table: 'birth_plans', row: { user_id: a.id, penolong: marker }, filters: [['user_id', a.id]], update: { penolong: `${marker}-changed` } },
  ]

  for (const test of cases) {
    const inserted = await clientA.from(test.table).insert(test.row).select('*').single()
    assert.ifError(inserted.error)
    const filters = test.filters ?? [['id', inserted.data.id]]
    cleanup.push({ name: test.table, run: async () => {
      let query = clientA.from(test.table).delete()
      for (const [field, value] of filters) query = query.eq(field, value)
      const result = await query.select(['dose_logs', 'birth_plans'].includes(test.table) ? 'user_id' : 'id')
      if (result.error) throw new Error(result.error.code ?? 'unknown')
    } })

    let readB = clientB.from(test.table).select('*')
    for (const [field, value] of filters) readB = readB.eq(field, value)
    const readResult = await readB
    assert.ifError(readResult.error)
    assert.equal(readResult.data.length, 0, `${test.table}: B cannot read A row`)

    let updateB = clientB.from(test.table).update(test.update).select('*')
    for (const [field, value] of filters) updateB = updateB.eq(field, value)
    const updateResult = await updateB
    assert.ifError(updateResult.error)
    assert.equal(updateResult.data.length, 0, `${test.table}: B cannot update A row`)

    let deleteB = clientB.from(test.table).delete().select('*')
    for (const [field, value] of filters) deleteB = deleteB.eq(field, value)
    const deleteResult = await deleteB
    assert.ifError(deleteResult.error)
    assert.equal(deleteResult.data.length, 0, `${test.table}: B cannot delete A row`)

    let ownerRead = clientA.from(test.table).select('*')
    for (const [field, value] of filters) ownerRead = ownerRead.eq(field, value)
    const ownerResult = await ownerRead
    assert.ifError(ownerResult.error)
    assert.equal(ownerResult.data.length, 1, `${test.table}: A still owns the row`)
    outcomes.push(`${test.table}: cross-account read/update/delete denied`)
  }

  const storagePath = `${a.id}/kritis3-${marker}.png`
  const image = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' })
  const uploaded = await clientA.storage.from('profile-avatars').upload(storagePath, image, { contentType: 'image/png' })
  assert.ifError(uploaded.error)
  cleanup.push({ name: 'profile-avatars', run: async () => {
    const result = await clientA.storage.from('profile-avatars').remove([storagePath, `${a.id}/kritis3-${marker}-forged.png`])
    if (result.error) throw new Error(result.error.statusCode ?? 'unknown')
  } })
  const downloadB = await clientB.storage.from('profile-avatars').download(storagePath)
  assert.ok(downloadB.error, 'B cannot download A avatar')
  const forgedPath = `${a.id}/kritis3-${marker}-forged.png`
  const forgedUpload = await clientB.storage.from('profile-avatars').upload(forgedPath, image, { contentType: 'image/png' })
  assert.ok(forgedUpload.error, 'B cannot upload into A avatar folder')
  const ownerDownload = await clientA.storage.from('profile-avatars').download(storagePath)
  assert.ifError(ownerDownload.error)
  outcomes.push('profile-avatars: cross-account read/write denied')
} finally {
  const cleanupErrors = []
  for (const clean of cleanup.reverse()) {
    try { await clean.run() } catch (error) { cleanupErrors.push(`${clean.name}:${error instanceof Error ? error.message : 'unknown'}`) }
  }
  assert.deepEqual(cleanupErrors, [], 'all synthetic rows and avatar objects must be removed')
}

console.log(JSON.stringify({ project: projectRef, accountA: a.id, accountB: b.id, outcomes, accountsRetained: true, syntheticDataCleaned: true }))
