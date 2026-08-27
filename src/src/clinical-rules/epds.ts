// S-03f & SK05: EPDS 10 item 0-3, total 0-30 — Tabel 1 Diva (Cox 1987)
// Klasifikasi: HIJAU 0-8 / KUNING 9-13 / MERAH >=14 atau item10>=1

export function scoreEPDS(answers: number[]): { total: number; kategori: 'HIJAU' | 'KUNING' | 'MERAH'; item10: number } {
  if (answers.length !== 10) throw new Error('EPDS butuh 10 jawaban')
  if (answers.some((v) => v < 0 || v > 3)) throw new Error('skor per item 0-3')
  const total = answers.reduce((a, b) => a + b, 0)
  const item10 = answers[9]
  let kategori: 'HIJAU' | 'KUNING' | 'MERAH' = 'HIJAU'
  if (item10 >= 1 || total >= 14) kategori = 'MERAH'
  else if (total >= 9) kategori = 'KUNING'
  return { total, kategori, item10 }
}


