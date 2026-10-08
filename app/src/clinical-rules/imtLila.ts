// SK03 & S-03b: IMT pra-hamil + LILA (IOM 2009, WHO <23.5 KEK)

export function calcIMT(bbKg: number, tbCm: number): number {
  const tbM = tbCm / 100
  return Math.round((bbKg / (tbM * tbM)) * 10) / 10
}

export type IMTKategori = 'Kurus' | 'Normal' | 'Gemuk' | 'Obesitas'
export function kategoriIMT(imt: number): { kat: IMTKategori; targetKg: [number, number] } {
  if (imt < 18.5) return { kat: 'Kurus', targetKg: [12.5, 18] }
  if (imt < 25) return { kat: 'Normal', targetKg: [11.5, 16] }
  if (imt < 30) return { kat: 'Gemuk', targetKg: [7, 11.5] }
  return { kat: 'Obesitas', targetKg: [5, 9] }
}

export function kategoriLILA(lilaCm: number): 'KEK' | 'Normal' {
  return lilaCm < 23.5 ? 'KEK' : 'Normal'
}

export function warnaGizi(imtKat: IMTKategori, lilaKat: 'KEK' | 'Normal', kenaikanKurang?: boolean): 'HIJAU' | 'KUNING' | 'MERAH' {
  if (lilaKat === 'KEK') return 'MERAH'
  if (imtKat === 'Kurus' || imtKat === 'Gemuk' || imtKat === 'Obesitas') return 'KUNING'
  if (kenaikanKurang) return 'KUNING'
  return 'HIJAU'
}

export function evaluasiGizi(input: { bbPreKg: number; tbCm: number; lilaCm: number; bbSekarangKg: number; ukMinggu: number }) {
  const imt = calcIMT(input.bbPreKg, input.tbCm)
  const { kat: imtKat, targetKg } = kategoriIMT(imt)
  const lilaKat = kategoriLILA(input.lilaCm)
  const kenaikanAktual = Math.round((input.bbSekarangKg - input.bbPreKg) * 10) / 10
  const targetProp = ((targetKg[0] + targetKg[1]) / 2) * (input.ukMinggu / 40)
  const kenaikanKurang = kenaikanAktual < targetProp - 1
  const trajectory = kenaikanKurang ? 'kurang' : kenaikanAktual > targetProp + 2 ? 'lebih' : 'sesuai'
  return { imt, imtKat, targetKg, lilaKat, kenaikanAktual, targetProp, kenaikanKurang, trajectory, warna: warnaGizi(imtKat, lilaKat, kenaikanKurang) }
}
