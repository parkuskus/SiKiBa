export type SavedStatus = "local" | "queued" | "failed" | "synced"

export function savedStatusMessage(status: SavedStatus, subject = "Data"): string {
  switch (status) {
    case "local": return `${subject} tersimpan di perangkat.`
    case "queued": return `${subject} tersimpan di perangkat, belum masuk ke akun.`
    case "failed": return `${subject} tersimpan di perangkat. Belum berhasil dikirim ke akun.`
    case "synced": return `${subject} tersimpan di perangkat dan akun.`
  }
}

export function syncNoticeMessage(pending: number, online: boolean, retryFailed: boolean): string {
  if (retryFailed) return "Data belum berhasil dikirim ke akun. Data masih tersimpan di perangkat. Periksa internet, lalu coba lagi."
  if (pending > 0) return `Ada ${pending} data yang belum masuk ke akun. Data tetap ada di perangkat${online ? "." : " dan akan dikirim saat internet tersedia."}`
  return "Tidak ada koneksi internet. Data baru tersimpan di perangkat ini."
}
