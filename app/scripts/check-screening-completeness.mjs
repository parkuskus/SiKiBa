import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { validateScreening, needsRepeat } from '../src/features/skrining/screeningCompleteness.ts'
import { warnaMEOWS } from '../src/clinical-rules/meows.ts'
import { kategoriKramer } from '../src/clinical-rules/kramerZone.ts'
import { scoreEPDS } from '../src/clinical-rules/epds.ts'

const samples = {
  poedji_rochjati: { usia: 26, ukMinggu: 20, paritas: 0, jawabanForm: { paritas: 'primi', jarak: 'belum', riwayatKomplikasi: ['tidak'], penyakitKronik: ['tidak'], gemeli: false, trb: false, letak: false, hidramnion: false }, riwayatPE: false, riwayatSC: false, riwayatKomplikasi: false, penyakitKronik: false, kehamilanGanda: false, trb: false, hidramnion: false, kelainanLetak: false },
  imt_lila: { bbPreKg: 55, tbCm: 160, lilaCm: 26, bbSekarangKg: 60, ukMinggu: 20 },
  danger_sign: { perdarahan: false, nyeriKepalaHebat: false, nyeriKepalaSkala: 0, pandanganKabur: false, nyeriAbdomenHebat: false, bengkakWajahTangan: false, gerakanJaninBerkurang: false, demamTinggi: false, ketubanPecah: false, sesakNapas: false },
  preeklamsia: { sistolik: 115, diastolik: 75, ukMinggu: 20, usia: 26, imtPre: 21.5, jarakTahun: 3, proteinuria: false, riwayatPE: false, htKronik: false, ginjalKronik: false, diabetesMelitus: false, autoimun: false, riwayatKeluargaPE: false, kehamilanGanda: false, nullipara: false, faktorDitinjau: true },
  dmg: { usia: 26, bbPreKg: 55, tbCm: 160, imtPre: 21.5, ukMinggu: 20, riwayatDMG: false, riwayatMakrosomia: false, riwayatDMKeluarga: false, glikosuria: false, pcos: false, etnisRisiko: false, faktorDitinjau: true },
  epds: { answers: Array(10).fill(0) },
  nifas: { hariKe: 0, suhu: 36.5, sistolik: 115, diastolik: 75, perdarahanMl: 100, lochiaBau: false, nyeriUterus: false, lukaBengkak: false, nyeriSkala: 0, produksiASI: 'ada', mood: 4, keluhanDitinjau: true },
  laktasi: { usiaBayiHari: 4, frekuensiMenyusuPerHari: 9, kondisiPuting: 'normal', kondisiPayudara: 'normal', volumeASI: 'cukup', bbBayiTren: 'naik', bakPerHari: 7, urin: 'jernih', demam: false },
  ikterus: { usiaBayiHari: 4, zona: 1, onsetJam: 30, aktivitas: 'aktif', fesesDempul: false, prematur: false, gejalaDitinjau: true },
  hipotiroid: { sudahTSH: false, usiaBayiHari: 2, gejala: { ikterusLama: false, konstipasi: false, tangisanSerak: false, aktivitasKurang: false, lidahBesar: false }, gejalaDitinjau: true },
}

for (const [tipe, input] of Object.entries(samples)) {
  assert.deepEqual(validateScreening(tipe, { userId: 'uji', ...input }), {}, `${tipe}: isian lengkap diterima`)
  assert.ok(Object.keys(validateScreening(tipe, { userId: 'uji' })).length, `${tipe}: isian kosong ditolak`)
}
for (const [tipe, field] of [['imt_lila', 'bbPreKg'], ['preeklamsia', 'sistolik'], ['dmg', 'imtPre'], ['nifas', 'suhu'], ['laktasi', 'bakPerHari'], ['ikterus', 'onsetJam']]) {
  assert.ok(validateScreening(tipe, { userId: 'uji', ...samples[tipe], [field]: NaN })[field], `${tipe}: NaN ditolak`)
}
assert.ok(validateScreening('dmg', { userId: 'uji', ...samples.dmg, glikosuria: null }).glikosuria)
assert.ok(validateScreening('preeklamsia', { userId: 'uji', ...samples.preeklamsia, proteinuria: undefined }).proteinuria)
assert.ok(validateScreening('preeklamsia', { userId: 'uji', ...samples.preeklamsia, usia: undefined }).usia)
assert.ok(validateScreening('preeklamsia', { userId: 'uji', ...samples.preeklamsia, imtPre: undefined }).imtPre)
assert.deepEqual(validateScreening('preeklamsia', { userId: 'uji', ...samples.preeklamsia, nullipara: true, jarakTahun: undefined }), {})
assert.ok(validateScreening('danger_sign', { userId: 'uji', ...samples.danger_sign, perdarahan: undefined }).perdarahan)
assert.ok(validateScreening('epds', { userId: 'uji', answers: Array(9).fill(0) }).answers)
assert.ok(validateScreening('epds', { userId: 'uji', answers: [...Array(9).fill(0), NaN] }).answers)
assert.ok(validateScreening('hipotiroid', { userId: 'uji', ...samples.hipotiroid, sudahTSH: undefined }).sudahTSH)
assert.ok(validateScreening('poedji_rochjati', { userId: 'uji', ...samples.poedji_rochjati, jawabanForm: undefined }).jawabanForm)
assert.ok(validateScreening('poedji_rochjati', { userId: 'uji', ...samples.poedji_rochjati, jawabanForm: { ...samples.poedji_rochjati.jawabanForm, gemeli: true } }).jawabanForm)
assert.ok(validateScreening('poedji_rochjati', { userId: 'uji', ...samples.poedji_rochjati, jawabanForm: { ...samples.poedji_rochjati.jawabanForm, penyakitKronik: ['hipertensi'] }, penyakitKronik: false }).jawabanForm)
assert.ok(validateScreening('nifas', { userId: 'uji', ...samples.nifas, perdarahanMl: undefined }).perdarahanMl)
assert.ok(validateScreening('ikterus', { userId: 'uji', ...samples.ikterus, gejalaDitinjau: false }).gejalaDitinjau)
assert.equal(needsRepeat({ tipe: 'imt_lila', kategori: 'HIJAU', detail: samples.imt_lila }), true)
assert.equal(needsRepeat({ tipe: 'imt_lila', kategori: 'HIJAU' }), true)
assert.equal(needsRepeat({ tipe: 'danger_sign', kategori: 'MERAH', detail: { ...samples.danger_sign, perdarahan: true } }), true)
assert.equal(needsRepeat({ tipe: 'imt_lila', kategori: 'HIJAU', detail: { userId: 'uji', ...samples.imt_lila, validasiKelengkapan: 1 } }), false)
assert.equal(needsRepeat({ tipe: 'imt_lila', kategori: 'HIJAU', detail: { userId: 'uji', ...samples.imt_lila, validasiKelengkapan: 1, bbPreKg: null } }), true)
assert.deepEqual(validateScreening('nifas', { userId: 'uji', ...samples.nifas, hariKe: 0, perdarahanMl: 0 }), {})
assert.deepEqual(validateScreening('epds', { userId: 'uji', answers: Array(10).fill(0) }), {})
assert.equal(warnaMEOWS({ sistolik: 165, diastolik: 80, suhu: 37 }), 'MERAH')
assert.equal(kategoriKramer({ zona: 1, onsetJam: 12 }).warna, 'MERAH')
assert.equal(scoreEPDS([...Array(9).fill(0), 1]).kategori, 'MERAH')
for (const file of ['ibu-hamil/riskFactorForm', 'ibu-hamil/giziForm', 'ibu-hamil/dangerSignForm', 'ibu-hamil/preeklamsiaForm', 'ibu-hamil/dmgForm', 'ibu-hamil/mentalForm', 'nifas/nifasForm', 'nifas/laktasiForm', 'bbl/ikterusForm', 'bbl/hipotiroidForm']) {
  const source = await readFile(new URL(`../src/features/skrining/${file}.ts`, import.meta.url), 'utf8')
  assert.match(source, /validateScreening\(/, `${file}: batas submit memvalidasi data`)
  assert.match(source, /validasiKelengkapan: 1/, `${file}: hasil baru diberi penanda`)
}
for (const file of ['ibu-hamil/PreeklamsiaScreen', 'ibu-hamil/DmgScreen', 'nifas/NifasScreen', 'bbl/IkterusScreen', 'bbl/HipotiroidScreen']) {
  const source = await readFile(new URL(`../src/features/skrining/${file}.tsx`, import.meta.url), 'utf8')
  assert.match(source, /Ditinjau|ditinjau/, `${file}: status peninjauan tidak boleh implisit`)
}
const history = await readFile(new URL('../src/features/profil/HistoryScreen.tsx', import.meta.url), 'utf8')
const menu = await readFile(new URL('../src/features/skrining/SkriningPage.tsx', import.meta.url), 'utf8')
const danger = await readFile(new URL('../src/features/skrining/ibu-hamil/DangerSignScreen.tsx', import.meta.url), 'utf8')
const mental = await readFile(new URL('../src/features/skrining/ibu-hamil/MentalScreen.tsx', import.meta.url), 'utf8')
const nifas = await readFile(new URL('../src/features/skrining/nifas/NifasScreen.tsx', import.meta.url), 'utf8')
const ikterus = await readFile(new URL('../src/features/skrining/bbl/IkterusScreen.tsx', import.meta.url), 'utf8')
const preeklamsia = await readFile(new URL('../src/features/skrining/ibu-hamil/PreeklamsiaScreen.tsx', import.meta.url), 'utf8')
assert.match(history, /needsRepeat\(/)
assert.match(menu, /needsRepeat\(/)
assert.match(danger, /EmergencyOverlay/)
assert.match(mental, /EmergencyOverlay/)
assert.match(mental, /detail\.answers\[9\][^\n]*setEmergencyOpen\(true\)/, 'jawaban EPDS positif yang dipulihkan membuka bantuan')
assert.match(nifas, /EmergencyOverlay/)
assert.match(ikterus, /EmergencyOverlay/)
assert.match(preeklamsia, /EmergencyOverlay/)
console.log('Kelengkapan 10 skrining dan riwayat terverifikasi')
