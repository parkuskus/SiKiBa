// S-01/S-02: UK & HPL — spec selisih bulan ×4⅓ & Naegele +9bln+7hr (SiKiBa_Spesifikasi_Storyboard_Prototype.md:124-138)

export function weeksFromHpht(hpht: string, todayStr?: string): number {
  const hp = new Date(hpht)
  const today = todayStr ? new Date(todayStr) : new Date()
  const months = (today.getFullYear() - hp.getFullYear()) * 12 + (today.getMonth() - hp.getMonth())
  // ponytail: rumus spec 4⅓ = 13/3 ≈ 4.333, selisih bulan × 4⅓
  const weeks = months * (13 / 3)
  // koreksi hari sisa: tambah (hari beda /7) biar akurat lintas bulan
  const dayDiff = today.getDate() - hp.getDate()
  return Math.max(0, Math.floor(weeks + dayDiff / 7))
}

export function calcHPL(hpht: string): string {
  const d = new Date(hpht)
  d.setMonth(d.getMonth() + 9)
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

export function trimester(uk: number): 1 | 2 | 3 {
  if (uk < 14) return 1
  if (uk < 28) return 2
  return 3
}

export function progressPercent(uk: number): number {
  return Math.min(100, Math.round((uk / 40) * 100))
}


