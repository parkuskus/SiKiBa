export type StoredScreeningDraft = {
  userId: string
  tipe: string
  createdAt: string
  detail: Record<string, unknown>
}

export function latestScreeningDraft(rows: StoredScreeningDraft[], userId: string, tipe: string) {
  let latest: StoredScreeningDraft | null = null
  for (const row of rows) {
    if (row.userId === userId && row.tipe === tipe && (!latest || row.createdAt > latest.createdAt)) latest = row
  }
  return latest?.detail ?? null
}
