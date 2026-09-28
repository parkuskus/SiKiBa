// S-03d & SK02: MAP = (2*diastolik + sistolik)/3 — stakeholder: <90 Normal, 90-99 Waspada, >99 Risiko tinggi PE

export function calcMAP(sistolik: number, diastolik: number): number {
  return Math.round(((2 * diastolik + sistolik) / 3) * 10) / 10
}

export function kategoriMAP(map: number): 'HIJAU' | 'KUNING' | 'MERAH' {
  if (map > 99) return 'MERAH'
  if (map >= 90) return 'KUNING'
  return 'HIJAU'
}

export function kategoriTD(sistolik: number, diastolik: number): 'HIJAU' | 'KUNING' | 'MERAH' {
  if (sistolik >= 160 || diastolik >= 110) return 'MERAH'
  if (sistolik >= 140 || diastolik >= 90) return 'KUNING'
  return 'HIJAU'
}


