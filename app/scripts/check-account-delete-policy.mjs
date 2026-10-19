import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const functionSource = await readFile('../supabase/functions/delete-account/index.ts', 'utf8')
const pageSource = await readFile('src/features/profil/ProfilPage.tsx', 'utf8')
const databaseSource = await readFile('src/data/db.ts', 'utf8')

assert.match(functionSource, /auth\.getUser\(token\)/, 'server verifies JWT through Supabase Auth')
assert.match(functionSource, /admin\.auth\.admin\.deleteUser\(user\.id\)/, 'server deletes only the verified caller')
assert.doesNotMatch(functionSource, /request\.json\(/, 'function accepts no target user ID in request body')
assert.ok(functionSource.indexOf('bucket.remove(') < functionSource.indexOf('deleteUser(user.id)'), 'avatar cleanup must succeed before Auth deletion')
assert.match(pageSource, /functions\.invoke\("delete-account"/, 'client calls authenticated account-delete function')
assert.ok(pageSource.indexOf('functions.invoke("delete-account"') < pageSource.indexOf('deleteLocalAccountData(session.user.id)'), 'local cleanup happens only after cloud success')
assert.ok(pageSource.indexOf('functions.invoke("delete-account"') < pageSource.indexOf('auth.signOut({ scope: "local" })'), 'local sign-out happens only after cloud success')
assert.match(databaseSource, /db\.syncQueue\.where\('userId'\)\.equals\(userId\)\.delete\(\)/, 'cleanup scopes queued writes to the deleted user')
assert.doesNotMatch(pageSource, /db\.delete\(\)/, 'account deletion does not erase other local profiles')

console.log('Kebijakan hapus akun: JWT identity, urutan cloud-first, dan cleanup lokal terverifikasi')
