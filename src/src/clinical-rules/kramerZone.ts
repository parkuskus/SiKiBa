// S-05a: Kramer zona ikterus neonatal (1969)

export type KramerInput = {
  zona: 1 | 2 | 3 | 4 | 5 // 1 kepala-leher ... 5 telapak kaki
  onsetJam: number // <24 patologis
  fesesDempul?: boolean
}

export function kategoriKramer(v: KramerInput): { zona: number; status: 'Fisiologis' | 'Waspadai' | 'Patologis'; warna: 'HIJAU' | 'KUNING' | 'MERAH' } {
  if (v.fesesDempul) return { zona: v.zona, status: 'Patologis', warna: 'MERAH' } // curiga atresia bilier
  if (v.onsetJam < 24) return { zona: v.zona, status: 'Patologis', warna: 'MERAH' }
  if (v.zona >= 4) return { zona: v.zona, status: 'Patologis', warna: 'MERAH' }
  if (v.zona === 3) return { zona: v.zona, status: 'Waspadai', warna: 'KUNING' }
  return { zona: v.zona, status: 'Fisiologis', warna: 'HIJAU' }
}
