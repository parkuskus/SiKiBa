import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const history = await readFile('src/features/profil/HistoryScreen.tsx', 'utf8')
for (const label of ['Kembali', 'Hapus riwayat']) {
  const button = new RegExp(`aria-label="${label}[\\s\\S]*?className="[^"]*(?:size-11|min-h-11)[^"]*"`)
  assert.match(history, button, `${label} action must meet the 44px touch target floor`)
}
assert.match(history, /aria-expanded=\{expanded === r\.id\}[\s\S]*?className="[^"]*(?:size-11|min-h-11)/, 'details action must meet the 44px touch target floor')
assert.match(history, /aria-expanded=\{expanded === r\.id\}/, 'history details disclose their state to assistive technology')
assert.match(history, /aria-label="Hapus riwayat"[\s\S]*?focus-visible:ring-2/, 'delete action has a visible keyboard focus indicator')

const educationMenu = await readFile('src/features/edukasi/EdukasiMenuScreen.tsx', 'utf8')
assert.match(educationMenu, /<img[\s\S]*?loading="lazy"/, 'offscreen education thumbnails should load lazily')
const laborTopic = await readFile('src/features/edukasi/TandaPersalinanScreen.tsx', 'utf8')
assert.match(laborTopic, /<img src=\{item\.gambar\}[^>]*loading="lazy"/, 'below-fold article images should load lazily')
const screeningPage = await readFile('src/features/skrining/SkriningPage.tsx', 'utf8')
assert.match(screeningPage, /role="group" aria-label="Pilihan jenis skrining"/, 'screening choices have an accessible group name')
assert.match(screeningPage, /aria-pressed=\{skriningTab === t\}[\s\S]*?min-h-11/, 'screening mode controls expose selection and meet the touch target floor')

console.log('Target sentuh, status aksesibel, dan gambar di bawah layar terverifikasi')
