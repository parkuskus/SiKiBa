import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const profilePage = await readFile('src/features/profil/ProfilPage.tsx', 'utf8')
const logout = profilePage.slice(profilePage.indexOf('const handleLogout'), profilePage.indexOf('const handleDeleteAccount'))

assert.match(logout, /signOut\(\{\s*scope:\s*["']local["']\s*\}\)/, 'logout must clear this device session without requiring network')
assert.match(logout, /removeItem\(["']siaga_active_user_id["']\)/, 'logout must clear cached account selection')
assert.match(logout, /void\s+disablePushNotifications\(\)\.catch\(/, 'push cleanup must not block local logout')
assert.match(logout, /disablePushNotifications\(\)\.catch\(/, 'push cleanup failure must be best-effort')

console.log('Kebijakan logout lokal, isolasi akun, dan cleanup push terverifikasi')
