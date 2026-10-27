import test from 'node:test'
import assert from 'node:assert/strict'
import { warnaMEOWS } from '../src/clinical-rules/meows.ts'
import { scoreEPDS } from '../src/clinical-rules/epds.ts'
import { scorePoedji } from '../src/clinical-rules/poedjiRochjati.ts'
import { calcMAP, kategoriMAP, kategoriTD } from '../src/clinical-rules/mapCalculator.ts'
import { calcIMT, evaluasiGizi, kategoriIMT, kategoriLILA, warnaGizi } from '../src/clinical-rules/imtLila.ts'
import { kategoriKramer } from '../src/clinical-rules/kramerZone.ts'
import { calcHPL, progressPercent, trimester, weeksFromHpht } from '../src/clinical-rules/ukHpl.ts'

test('EPDS classifies total-score boundaries and item 10 independently', () => {
  const answers = (total) => {
    const firstNine = []
    let remaining = total
    for (let i = 0; i < 9; i++) {
      const score = Math.min(3, remaining)
      firstNine.push(score)
      remaining -= score
    }
    return [...firstNine, 0]
  }
  assert.equal(scoreEPDS(answers(8)).kategori, 'HIJAU')
  assert.equal(scoreEPDS(answers(9)).kategori, 'KUNING')
  assert.equal(scoreEPDS(answers(13)).kategori, 'KUNING')
  assert.equal(scoreEPDS(answers(14)).kategori, 'MERAH')
  assert.equal(scoreEPDS([...Array(9).fill(0), 1]).kategori, 'MERAH')
  assert.throws(() => scoreEPDS(Array(9).fill(0)), /10 jawaban/)
  assert.throws(() => scoreEPDS([4, ...Array(9).fill(0)]), /0-3/)
})

test('Poedji score keeps base, KRS, and KRT thresholds', () => {
  assert.deepEqual(scorePoedji({ usia: 20, paritas: 0 }), { skor: 2, kategori: 'KRR', warna: 'HIJAU' })
  assert.equal(scorePoedji({ usia: 19, paritas: 0 }).kategori, 'KRS')
  assert.equal(scorePoedji({ usia: 20, paritas: 0, jarakTahun: 2 }).skor, 2)
  assert.equal(scorePoedji({ usia: 20, paritas: 0, jarakTahun: 1 }).skor, 6)
  assert.equal(scorePoedji({ usia: 20, paritas: 0, riwayatKomplikasi: true }).kategori, 'KRS')
  assert.equal(scorePoedji({ usia: 20, paritas: 0, riwayatSC: true }).kategori, 'KRT')
  assert.equal(scorePoedji({ usia: 35, paritas: 3 }).skor, 2)
  assert.equal(scorePoedji({ usia: 36, paritas: 3 }).skor, 6)
  assert.equal(scorePoedji({ usia: 20, paritas: 3 }).skor, 2)
  assert.equal(scorePoedji({ usia: 20, paritas: 4 }).skor, 6)
  assert.equal(scorePoedji({ usia: 20, paritas: 5 }).skor, 10)
})

test('MAP calculation and category boundaries remain stable', () => {
  assert.equal(calcMAP(120, 75), 90)
  assert.equal(kategoriMAP(89.9), 'HIJAU')
  assert.equal(kategoriMAP(90), 'KUNING')
  assert.equal(kategoriMAP(99), 'KUNING')
  assert.equal(kategoriMAP(99.1), 'MERAH')
  assert.equal(kategoriTD(139, 89), 'HIJAU')
  assert.equal(kategoriTD(140, 89), 'KUNING')
  assert.equal(kategoriTD(159, 109), 'KUNING')
  assert.equal(kategoriTD(160, 89), 'MERAH')
  assert.equal(kategoriTD(139, 110), 'MERAH')
})

test('IMT, LILA, and nutrition category boundaries remain stable', () => {
  assert.equal(calcIMT(70, 175), 22.9)
  assert.equal(kategoriIMT(18.4).kat, 'Kurus')
  assert.equal(kategoriIMT(18.5).kat, 'Normal')
  assert.equal(kategoriIMT(24.9).kat, 'Normal')
  assert.equal(kategoriIMT(25).kat, 'Gemuk')
  assert.equal(kategoriIMT(29.9).kat, 'Gemuk')
  assert.equal(kategoriIMT(30).kat, 'Obesitas')
  assert.equal(kategoriLILA(23.4), 'KEK')
  assert.equal(kategoriLILA(23.5), 'Normal')
  assert.equal(warnaGizi('Normal', 'KEK'), 'MERAH')
  assert.equal(warnaGizi('Normal', 'Normal', true), 'KUNING')
  assert.equal(evaluasiGizi({ bbPreKg: 60, tbCm: 165, lilaCm: 23.5, bbSekarangKg: 65.8, ukMinggu: 40 }).trajectory, 'kurang')
  assert.equal(evaluasiGizi({ bbPreKg: 60, tbCm: 165, lilaCm: 23.5, bbSekarangKg: 72.8, ukMinggu: 40 }).trajectory, 'sesuai')
  assert.equal(evaluasiGizi({ bbPreKg: 60, tbCm: 165, lilaCm: 23.5, bbSekarangKg: 75.8, ukMinggu: 40 }).trajectory, 'lebih')
})

test('MEOWS boundaries and red-flag inputs retain their categories', () => {
  const baseline = { sistolik: 120, diastolik: 80, suhu: 37 }
  assert.equal(warnaMEOWS(baseline), 'HIJAU')
  assert.equal(warnaMEOWS({ ...baseline, sistolik: 150 }), 'KUNING')
  assert.equal(warnaMEOWS({ ...baseline, sistolik: 159 }), 'KUNING')
  assert.equal(warnaMEOWS({ ...baseline, sistolik: 160 }), 'HIJAU')
  assert.equal(warnaMEOWS({ ...baseline, diastolik: 109 }), 'KUNING')
  assert.equal(warnaMEOWS({ ...baseline, diastolik: 110 }), 'HIJAU')
  assert.equal(warnaMEOWS({ ...baseline, sistolik: 89 }), 'MERAH')
  assert.equal(warnaMEOWS({ ...baseline, diastolik: 59 }), 'MERAH')
  assert.equal(warnaMEOWS({ ...baseline, suhu: 35.9 }), 'MERAH')
  assert.equal(warnaMEOWS({ ...baseline, suhu: 36 }), 'HIJAU')
  assert.equal(warnaMEOWS({ ...baseline, sistolik: 161 }), 'MERAH')
  assert.equal(warnaMEOWS({ ...baseline, suhu: 38 }), 'KUNING')
  assert.equal(warnaMEOWS({ ...baseline, suhu: 38.4 }), 'KUNING')
  assert.equal(warnaMEOWS({ ...baseline, suhu: 38.5 }), 'HIJAU')
  assert.equal(warnaMEOWS({ ...baseline, suhu: 38.6 }), 'MERAH')
  assert.equal(warnaMEOWS({ ...baseline, nadi: 39 }), 'MERAH')
  assert.equal(warnaMEOWS({ ...baseline, nadi: 40 }), 'HIJAU')
  assert.equal(warnaMEOWS({ ...baseline, nadi: 130 }), 'HIJAU')
  assert.equal(warnaMEOWS({ ...baseline, nadi: 131 }), 'MERAH')
  assert.equal(warnaMEOWS({ ...baseline, spo2: 94 }), 'MERAH')
  assert.equal(warnaMEOWS({ ...baseline, spo2: 95 }), 'HIJAU')
  assert.equal(warnaMEOWS({ ...baseline, perdarahanMl: 500 }), 'HIJAU')
  assert.equal(warnaMEOWS({ ...baseline, perdarahanMl: 501 }), 'MERAH')
  assert.equal(warnaMEOWS({ ...baseline, adaDemamNyeriUterus: true }), 'MERAH')
})

test('Kramer onset, zone, and stool boundaries retain their categories', () => {
  assert.equal(kategoriKramer({ zona: 2, onsetJam: 24 }).warna, 'HIJAU')
  assert.equal(kategoriKramer({ zona: 3, onsetJam: 24 }).warna, 'KUNING')
  assert.equal(kategoriKramer({ zona: 4, onsetJam: 24 }).warna, 'MERAH')
  assert.equal(kategoriKramer({ zona: 1, onsetJam: 23 }).warna, 'MERAH')
  assert.equal(kategoriKramer({ zona: 1, onsetJam: 24, fesesDempul: true }).warna, 'MERAH')
})

test('gestational week, HPL, trimester, and progress boundaries remain stable', () => {
  assert.equal(weeksFromHpht('2026-01-01', '2026-01-01'), 0)
  assert.equal(weeksFromHpht('2026-01-01', '2025-12-01'), 0)
  assert.equal(calcHPL('2026-01-01'), '2026-10-08')
  assert.equal(trimester(13), 1)
  assert.equal(trimester(14), 2)
  assert.equal(trimester(27), 2)
  assert.equal(trimester(28), 3)
  assert.equal(progressPercent(20), 50)
  assert.equal(progressPercent(45), 100)
})
