# FIXTURES.md — data contoh realistis SIAGA Bunda

> Data contoh realistis untuk isi Figma + uji implementasi nanti. Bukan
> salinan database lama — kontrak baru yang akan dipakai kedua sisi.
> Semua tanggal ISO `YYYY-MM-DD`, jam `HH.mm`. ID contoh pakai prefix
> `demo-`, bukan UUID asli.

## Profil ibu (S-01/S-02)

| Field | Nilai |
|---|---|
| id | `demo-siti` |
| nama | Siti Aminah |
| tanggal_lahir | `1998-05-12` |
| noHp | `081234567890` |
| hpht | `2025-11-19` |
| gravida / para / abortus | 2 / 1 / 0 |
| fasyankes | Puskesmas Cibangkong |
| nama_bidan | Bidan Wati |
| createdAt | `2026-08-28T08.00.00+07.00` |
| Turunan | UK 28 minggu, HPL `2026-08-26`, trimester 3 |

## Hasil skrining (S-03g, 3 contoh)

| tipe | skor | kategori | createdAt |
|---|---|---|---|
| `poedji_rochjati` | 6 | KUNING | `2026-08-28T09.15.00+07.00` |
| `imt_lila` | 22.4 | HIJAU | `2026-08-28T09.20.00+07.00` |
| `epds` | 11 | KUNING | `2026-08-29T10.00.00+07.00` |

Detail JSON tiap tipe mengikuti `*Form.ts` (misal `detail: {skor, faktorRisiko,
rekomendasi}`). Hasil MERAH tidak boleh dihapus pengguna.

## Tracker BB (S-07)

| tanggal | beratKg |
|---|---|
| `2026-07-03` | 58.0 |
| `2026-07-10` | 58.4 |
| `2026-07-17` | 58.9 |
| `2026-07-24` | 59.2 |

BB pra-hamil 55.0 kg, TB 156 cm, IMT 22.6 Normal, target +11.5 sampai 16 kg.

## Suplemen + ANC + Diary (S-07a–c)

SupplementReminder `demo-fe`: Tablet Fe 60mg, `19.00` harian, aktif,
`riwayatKepatuhan [1,1,1,0,1,1,1]`. ANCVisit: `2026-09-02` Puskesmas
Cibangkong selesai + catatan, `2026-09-30` terjadwal. DiaryEntry
`2026-08-30`: mood 4 dari 5, judul `Tendangan pertama`, teks
`Si kecil aktif sekali malam ini`.

## Nifas + BBL (S-04–S-05)

NifasScreening hari ke-3: TD 120/80, suhu 36.8, lochia rubra normal, status
HIJAU, `2026-09-15T08.00.00+07.00`. BBLProfile: lahir `2026-09-12 07.30`,
BB 3100 gram, PB 49 cm, APGAR 9, cukup bulan. Ikterus zona 2 hari ke-3
fisiologis. TSH `2026-09-14` sudah.

## Perangkat demo

| Perangkat | Serial_SCROLL |
|---|---|
| Android Samsung A14 (UAT 1) | `SBA14-2026-001` |
| Android Redmi 12 (UAT 2) | `SR12-2026-002` |
| iPhone 11 (uji install) | `IP11-2026-003` |

Stempel waktu uji lintas-perangkat memakai zona `+07.00` (WIB).
