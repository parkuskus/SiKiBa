// SK01 & S-03a: Skor Poedji Rochjati — KRR 2 / KRS 4-6 / KRT >=8 (S-03a:178, SK01:478)

export type PoedjiInput = {
  usia: number
  paritas: number // jumlah anak
  jarakTahun?: number
  riwayatKomplikasi?: boolean // komplikasi umum non-SC +4 (SK01)
  riwayatSC?: boolean // +8
  riwayatPE?: boolean
  penyakitKronik?: boolean // HT, DM, Jantung, Ginjal, SLE
  kehamilanGanda?: boolean
  kelainanLetak?: boolean // lintang/sungsang UK>=32
  hidramnion?: boolean
}

export function scorePoedji(v: PoedjiInput): { skor: number; kategori: 'KRR' | 'KRS' | 'KRT'; warna: 'HIJAU' | 'KUNING' | 'MERAH' } {
  let s = 2 // skor dasar semua ibu
  if (v.usia < 20 || v.usia > 35) s += 4
  if (v.paritas >= 4) s += 4
  // ponytail: spec tulis dua baris (grande >=4 + terlalu banyak >4) — implement apa adanya, paritas 5+ total +8
  if (v.paritas > 4) s += 4
  if (v.jarakTahun !== undefined && v.jarakTahun < 2) s += 4
  if (v.riwayatKomplikasi) s += 4
  if (v.riwayatSC) s += 8
  if (v.riwayatPE) s += 4
  if (v.penyakitKronik) s += 8
  if (v.kehamilanGanda) s += 4
  if (v.hidramnion) s += 4
  if (v.kelainanLetak) s += 8

  let kategori: 'KRR' | 'KRS' | 'KRT' = 'KRR'
  let warna: 'HIJAU' | 'KUNING' | 'MERAH' = 'HIJAU'
  if (s >= 8) { kategori = 'KRT'; warna = 'MERAH' }
  else if (s >= 4) { kategori = 'KRS'; warna = 'KUNING' }
  return { skor: s, kategori, warna }
}
