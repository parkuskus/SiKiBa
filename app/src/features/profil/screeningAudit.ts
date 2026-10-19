export function getScreeningGestationalAge(detail: Record<string, unknown>): string | null {
  const weeks = detail.ukMinggu ?? detail.usiaGestasi ?? detail.mingguKe
  return typeof weeks === 'number' && Number.isFinite(weeks) ? `${weeks} minggu` : null
}

export function getScreeningAuditFields(detail: Record<string, unknown>) {
  return Object.entries(detail)
    .filter(([key]) => key !== 'userId' && key !== 'validasiKelengkapan')
    .map(([key, rawValue]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())
      const value = rawValue === null || rawValue === undefined
        ? 'Belum diperiksa'
        : typeof rawValue === 'boolean'
          ? rawValue ? 'Ya' : 'Tidak'
          : Array.isArray(rawValue)
            ? rawValue.length ? rawValue.join(', ') : 'Tidak ada'
            : typeof rawValue === 'object'
              ? JSON.stringify(rawValue)
              : String(rawValue)
      return { label, value }
    })
}
