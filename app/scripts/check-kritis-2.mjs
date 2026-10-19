import assert from 'node:assert/strict'
import { needsGiziReview } from '../src/features/skrining/giziReview.ts'
import { evaluasiGizi } from '../src/clinical-rules/imtLila.ts'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const result = (trajectory, kategori = 'HIJAU', tipe = 'imt_lila') => ({ tipe, kategori, detail: { trajectory } })

assert.equal(needsGiziReview(result('lebih')), true, 'kenaikan BB lebih tidak boleh ditampilkan sebagai aman')
assert.equal(needsGiziReview(result('sesuai')), false, 'kenaikan sesuai tidak ditandai lebih')
assert.equal(needsGiziReview(result('kurang', 'KUNING')), false, 'kategori lain tidak tertimpa')
assert.equal(needsGiziReview(result('lebih', 'MERAH')), false, 'peringatan gizi tidak menutupi arahan MERAH')
assert.equal(needsGiziReview(result('lebih', 'HIJAU', 'dmg')), false, 'hasil skrining lain tidak berubah')
assert.equal(needsGiziReview({ tipe: 'imt_lila', kategori: 'HIJAU', detail: {} }), false, 'hasil lama tanpa data tidak ditebak')
const gizi = evaluasiGizi({ bbPreKg: 60, tbCm: 165, lilaCm: 26, bbSekarangKg: 80, ukMinggu: 20 })
assert.equal(gizi.trajectory, 'lebih', 'contoh hasil Kenaikan BB lebih terulang')
assert.equal(needsGiziReview({ tipe: 'imt_lila', kategori: gizi.warna, detail: { trajectory: gizi.trajectory } }), true, 'warna HIJAU lama pada hasil kenaikan lebih ditandai untuk ditinjau')

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: SkriningResultScreen } = await vite.ssrLoadModule('/src/features/skrining/components/SkriningResultScreen.tsx')
  const { default: HistoryScreen } = await vite.ssrLoadModule('/src/features/profil/HistoryScreen.tsx')
  const props = { tipeLabel: 'Status Gizi', warna: 'HIJAU', kategori: 'Normal', faktorRisiko: ['Kenaikan BB lebih'], faktorAman: [], rekomendasi: ['Konsultasikan hasil'], urgensiLabel: 'Tinjau BB', waktuISO: '2026-10-19T00:00:00Z', onUlangi() {}, onBeranda() {}, onBagikan() {} }
  const review = renderToStaticMarkup(createElement(SkriningResultScreen, { ...props, perluTinjauGizi: true }))
  assert.match(review, /TINJAU BB/, 'hasil kenaikan BB lebih terlihat untuk ditinjau')
  assert.match(review, /Kenaikan BB perlu ditinjau/, 'hasil menyebut alasan peninjauan')
  assert.doesNotMatch(review, />AMAN</, 'hasil lebih tidak menyebut aman')
  assert.match(review, /bukan diagnosis/, 'keterbatasan skrining dijelaskan')
  const emergency = renderToStaticMarkup(createElement(SkriningResultScreen, { ...props, warna: 'MERAH', perluTinjauGizi: true }))
  assert.match(emergency, /Segera cari bantuan/, 'penanda tinjau tidak menutup arahan darurat')
  assert.doesNotMatch(emergency, /TINJAU BB/, 'hasil merah tetap diprioritaskan')
  const history = renderToStaticMarkup(createElement(HistoryScreen, { history: [{ id: 'uji', userId: 'uji', tipe: 'imt_lila', skor: 22, kategori: 'HIJAU', detail: { userId: 'uji', bbPreKg: 60, tbCm: 165, lilaCm: 26, bbSekarangKg: 80, ukMinggu: 20, trajectory: 'lebih', validasiKelengkapan: 1 }, createdAt: '2026-10-19T00:00:00Z' }], onBack() {}, onChanged() {} }))
  assert.match(history, /Tinjau BB/, 'riwayat hasil lama dengan BB lebih tidak menyebut aman')
  assert.doesNotMatch(history, />Aman</, 'riwayat tidak memberi klaim aman palsu')
} finally {
  await vite.close()
}

console.log('Penanda tinjau kenaikan BB terverifikasi')
