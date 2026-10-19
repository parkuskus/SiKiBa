export function needsGiziReview(result: { tipe: string; kategori: string; detail: Record<string, unknown> }): boolean {
  return result.tipe === 'imt_lila' && result.kategori === 'HIJAU' && result.detail?.trajectory === 'lebih'
}
