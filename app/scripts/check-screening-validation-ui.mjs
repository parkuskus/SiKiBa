import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import * as validationUI from '../src/features/skrining/components/screeningValidationUI.ts'
import { validateScreening } from '../src/features/skrining/screeningCompleteness.ts'
const { toScreeningIssues, numericOrMissing } = validationUI

assert.equal(Number.isNaN(numericOrMissing('')), true, 'kolom angka kosong bukan nol')
assert.equal(numericOrMissing('0'), 0, 'nol yang ditulis tetap nol')
assert.equal(validationUI.weekFromSavedOrProfile?.(null, '22'), '22', 'draft gizi tanpa minggu memakai HPHT yang baru')
assert.equal(validationUI.weekFromSavedOrProfile?.(46, '22'), '22', 'draft gizi tidak valid memakai HPHT yang diperbaiki')
assert.equal(validationUI.weekFromSavedOrProfile?.(20, '22'), '20', 'draft lama yang valid tidak ditimpa')
assert.equal(validationUI.weekFromSavedOrProfile?.('20', '22'), '20', 'draft tersimpan sebagai teks tetap diterima')
assert.equal(validationUI.weekFromSavedOrProfile?.(0, '22'), '0', 'usia kehamilan nol dari draft adalah sah')
assert.equal(validationUI.weekFromSavedOrProfile?.(false, '22'), '22', 'status boolean lama tidak dianggap usia kehamilan nol')
assert.equal(validationUI.weekFromSavedOrProfile?.(46, ''), '', 'profil yang belum lengkap tetap kosong')
assert.deepEqual(toScreeningIssues({ sistolik: 'Sistolik harus 70–250', proteinuria: 'Jawab protein urine' }, {
  sistolik: 'Tekanan darah sistolik', proteinuria: 'Protein urine',
}), [
  { key: 'sistolik', label: 'Tekanan darah sistolik', instruction: 'Sistolik harus 70–250' },
  { key: 'proteinuria', label: 'Protein urine', instruction: 'Jawab protein urine' },
])
assert.deepEqual(toScreeningIssues({ userId: 'Pengguna belum tersedia' }, {}), [], 'error pengguna bukan field isian')
assert.deepEqual(toScreeningIssues({ nyeriKepalaHebat: 'Jawab nyeriKepalaHebat dengan Ya atau Tidak' }, { nyeriKepalaHebat: 'Nyeri kepala hebat' }), [
  { key: 'nyeriKepalaHebat', label: 'Nyeri kepala hebat', instruction: 'Pilih Ya atau Tidak untuk Nyeri kepala hebat' },
], 'petunjuk tidak membocorkan nama variabel internal')
const riskErrors = validateScreening('poedji_rochjati', { userId: 'uji', usia: 25, ukMinggu: 20, paritas: NaN, jarakTahun: undefined })
assert.deepEqual(toScreeningIssues({ paritas: riskErrors.paritas, jarakTahun: riskErrors.jarakTahun }, {
  paritas: 'Status paritas', jarakTahun: 'Jarak kehamilan',
}, {
  paritas: 'Pilih Hamil pertama, Hamil ke 2 sampai 3, atau Hamil ke 4 atau lebih',
  jarakTahun: 'Pilih Kurang dari 2, 2 atau lebih, atau Belum pernah hamil sebelumnya',
}), [
  { key: 'paritas', label: 'Status paritas', instruction: 'Pilih Hamil pertama, Hamil ke 2 sampai 3, atau Hamil ke 4 atau lebih' },
  { key: 'jarakTahun', label: 'Jarak kehamilan', instruction: 'Pilih Kurang dari 2, 2 atau lebih, atau Belum pernah hamil sebelumnya' },
], 'pilihan yang diperbaiki muncul di sheet, bukan nilai angka internal')
assert.ok(validateScreening('nifas', { userId: 'uji', hariKe: numericOrMissing('') }).hariKe, 'hari nifas kosong tetap kosong')
assert.equal(validateScreening('nifas', { userId: 'uji', hariKe: numericOrMissing('0') }).hariKe, undefined, 'hari nifas nol sah')
assert.ok(validateScreening('ikterus', { userId: 'uji', zona: null }).zona, 'zona Kramer belum dipilih')
assert.ok(validateScreening('hipotiroid', { userId: 'uji', sudahTSH: null }).sudahTSH, 'TSH belum dijawab')
assert.equal(validateScreening('hipotiroid', { userId: 'uji', sudahTSH: false }).sudahTSH, undefined, 'TSH Belum adalah jawaban')
const invalid = (tipe, input, key) => validateScreening(tipe, { userId: 'uji', ...input })[key]
assert.equal(invalid('preeklamsia', { sistolik: 300 }, 'sistolik'), 'Isi Sistolik dengan angka 70 sampai 250 mmHg', 'tekanan darah di luar rentang menyebut batas dan satuan')
assert.equal(invalid('imt_lila', { lilaCm: numericOrMissing('') }, 'lilaCm'), 'Isi LILA dengan angka 15 sampai 40', 'kolom kosong menyebut batas yang diterima')
assert.equal(invalid('nifas', { hariKe: -1 }, 'hariKe'), 'Isi Hari nifas dengan angka 0 sampai 42', 'nol tetap termasuk batas sah')
assert.equal(invalid('laktasi', { durasiMenyusuMenit: 241 }, 'durasiMenyusuMenit'), 'Isi durasi menyusu dengan angka 0 sampai 240', 'isian opsional yang salah menyebut batasnya')
assert.equal(invalid('poedji_rochjati', { tbCm: 99 }, 'tbCm'), 'Isi tinggi badan dengan angka 100 sampai 200', 'pengukuran opsional menyebut batas')
assert.equal(invalid('ikterus', { zona: 6 }, 'zona'), 'Pilih zona Kramer 1 sampai 5', 'zona tidak sah menyebut pilihan yang ada')
assert.equal(invalid('laktasi', { kondisiPuting: 'lainnya' }, 'kondisiPuting'), 'Pilih kondisiPuting dari normal, nyeri, luka, atau masuk', 'pilihan tidak sah menyebut opsi')
assert.equal(invalid('laktasi', { bbBayiTren: 'lainnya' }, 'bbBayiTren'), 'Pilih bbBayiTren dari naik, tetap, atau turun', 'opsi diterangkan dengan label yang terlihat di form')
assert.equal(invalid('laktasi', { urin: 'lainnya' }, 'urin'), 'Pilih urin dari jernih, kuning, atau gelap pekat', 'warna urin menggunakan label yang terlihat di form')
assert.equal(invalid('preeklamsia', { nullipara: false, jarakTahun: 81 }, 'jarakTahun'), 'Isi jarak kehamilan sebelumnya dengan angka 0 sampai 80', 'jarak kehamilan yang salah menyebut batas')
assert.equal(invalid('preeklamsia', { imtPre: 0 }, 'imtPre'), 'Isi IMT sebelum hamil dengan angka 0,1 sampai 100', 'angka pecahan mengikuti penulisan Indonesia')
assert.equal(invalid('danger_sign', { nyeriKepalaSkala: 6 }, 'nyeriKepalaSkala'), 'Isi Skala nyeri kepala dengan angka 0 sampai 5', 'skala nyeri menyebut batas')
assert.equal(invalid('hipotiroid', { sudahTSH: null }, 'sudahTSH'), 'Pilih Sudah atau Belum untuk pemeriksaan TSH', 'petunjuk TSH sesuai tombol yang tersedia')
assert.equal(invalid('nifas', { produksiASI: null }, 'produksiASI'), 'Pilih produksi ASI dari ada, sedikit, atau tidak ada', 'petunjuk ASI sesuai tombol yang tersedia')
assert.deepEqual(toScreeningIssues({ sistolik: invalid('preeklamsia', { sistolik: 300 }, 'sistolik') }, { sistolik: 'Tekanan darah sistolik' }), [
  { key: 'sistolik', label: 'Tekanan darah sistolik', instruction: 'Isi Sistolik dengan angka 70 sampai 250 mmHg' },
], 'batas yang diterima sampai ke daftar bottom sheet')
for (const file of ['ibu-hamil/RiskFactorScreen', 'ibu-hamil/GiziScreen', 'ibu-hamil/DangerSignScreen', 'ibu-hamil/PreeklamsiaScreen', 'ibu-hamil/DmgScreen', 'ibu-hamil/MentalScreen', 'nifas/NifasScreen', 'nifas/LaktasiScreen', 'bbl/IkterusScreen', 'bbl/HipotiroidScreen']) {
  const source = await readFile(new URL(`../src/features/skrining/${file}.tsx`, import.meta.url), 'utf8')
  assert.match(source, /ScreeningValidationSheet/, `${file}: menampilkan daftar isian`)
  assert.match(source, /ScreeningMarker/, `${file}: menandai isian`)
}
const pe = await readFile(new URL('../src/features/skrining/ibu-hamil/PreeklamsiaScreen.tsx', import.meta.url), 'utf8')
assert.match(pe, /jarakTahun: !anakPertama && jarak \? Number\(jarak\) : undefined/, 'kehamilan pertama tidak menyimpan jarak kehamilan')
const gizi = await readFile(new URL('../src/features/skrining/ibu-hamil/GiziScreen.tsx', import.meta.url), 'utf8')
assert.match(gizi, /onOpenProfile/, 'HPHT yang belum ada harus dapat dibuka di Profil')
const risk = await readFile(new URL('../src/features/skrining/ibu-hamil/RiskFactorScreen.tsx', import.meta.url), 'utf8')
assert.match(risk.split('const handleSubmit = async () =>')[1], /if \(!kompl.length \|\| !kronik.length\)/, 'komplikasi yang terhapus saat langkah akhir kembali ke langkah kedua')
const dmg = await readFile(new URL('../src/features/skrining/ibu-hamil/DmgScreen.tsx', import.meta.url), 'utf8')
assert.equal(invalid('dmg', { usia: 25, bbPreKg: 0.1, tbCm: 250, imtPre: 0, ukMinggu: 20, glikosuria: false, faktorDitinjau: true, riwayatDMG: false, riwayatMakrosomia: false, riwayatDMKeluarga: false, pcos: false, etnisRisiko: false }, 'imtPre'), 'Isi IMT dengan angka 0,1 sampai 300', 'IMT hasil hitung bisa salah meski kedua ukuran diterima')
assert.ok(dmg.includes('validation.focus(validation.issues[0]?.key === "imtPre" ? "bbPreKg" : validation.issues[0]?.key)'), 'perbaikan IMT mengarahkan pengguna ke BB yang bisa diedit')
assert.ok(dmg.includes('field.key === "bbPreKg" || field.key === "tbCm"'), 'kesalahan IMT juga menandai ukuran yang dapat diperbaiki')
for (const [source, group] of [[pe, 'pe-protein-error'], [await readFile(new URL('../src/features/skrining/nifas/NifasScreen.tsx', import.meta.url), 'utf8'), 'nifas-asi-error'], [await readFile(new URL('../src/features/skrining/bbl/HipotiroidScreen.tsx', import.meta.url), 'utf8'), 'tsh-error']]) {
  assert.ok(source.includes(`aria-describedby={validation.errors.`) && source.includes(`"${group}"`), `${group}: kelompok pilihan mengumumkan kesalahan`)
}
const focus = await readFile(new URL('../src/features/skrining/components/useScreeningValidation.tsx', import.meta.url), 'utf8')
assert.doesNotMatch(focus, /\?\? field\s*\n/, 'elemen noninteraktif tidak dipaksa menerima fokus')
console.log('Daftar masalah skrining dan angka kosong terverifikasi')
