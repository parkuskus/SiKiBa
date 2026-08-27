// SK06 & S-04: MEOWS — Maternal Early Warning (nifas 0-42hr)

export type MEOWSInput = {
  sistolik: number
  diastolik: number
  nadi?: number
  suhu: number // °C
  spo2?: number
  perdarahanMl?: number
  adaDemamNyeriUterus?: boolean
}

export function warnaMEOWS(v: MEOWSInput): 'HIJAU' | 'KUNING' | 'MERAH' {
  // MERAH
  if (v.sistolik > 160 || v.sistolik < 90 || v.diastolik > 110 || v.diastolik < 60) return 'MERAH'
  if (v.suhu > 38.5 || v.suhu < 36) return 'MERAH'
  if (v.nadi !== undefined && (v.nadi > 130 || v.nadi < 40)) return 'MERAH'
  if (v.spo2 !== undefined && v.spo2 < 95) return 'MERAH'
  if (v.perdarahanMl !== undefined && v.perdarahanMl > 500) return 'MERAH'
  if (v.adaDemamNyeriUterus) return 'MERAH'
  // KUNING
  if ((v.sistolik >= 150 && v.sistolik <= 159) || (v.diastolik >= 100 && v.diastolik <= 109) || (v.sistolik >= 80 && v.sistolik <= 89)) return 'KUNING'
  if (v.suhu >= 38 && v.suhu <= 38.4) return 'KUNING'
  return 'HIJAU'
}
