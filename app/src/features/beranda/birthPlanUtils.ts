import type { BirthPlan } from "@/data/db"

export function parseEstimasiDana(value: unknown): number | null {
  const amount = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function sameFlags(a: Record<string, boolean>, b: Record<string, boolean>) {
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  return aKeys.length === bKeys.length && aKeys.every((key, index) => key === bKeys[index] && a[key] === b[key])
}

export function sameBirthPlanContent(a: BirthPlan, b: BirthPlan) {
  return a.penolong === b.penolong && a.tempatBersalin === b.tempatBersalin && a.pendamping === b.pendamping
    && a.hpBidanSiaga === b.hpBidanSiaga && a.donor1Nama === b.donor1Nama && a.donor1GolonganDarah === b.donor1GolonganDarah
    && a.donor2Nama === b.donor2Nama && a.donor2GolonganDarah === b.donor2GolonganDarah && a.transportasi === b.transportasi
    && a.estimasiDana === b.estimasiDana && sameFlags(a.checklistPerlengkapan, b.checklistPerlengkapan)
    && sameFlags(a.tandaPersalinanDipahami, b.tandaPersalinanDipahami)
}
