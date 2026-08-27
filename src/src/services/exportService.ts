import jsPDF from 'jspdf'
import { db } from '@/data/db'

// S-08b: Export PDF rudimentary — watermark + header + 3 tabel (profil, skrining, tracker)
// ponytail: template minimal, desain final menyusul pas FE fix

export async function generateRingkasanPDF(userId: string): Promise<Blob> {
  const profile = await db.profiles.get(userId)
  if (!profile) throw new Error('profil tidak ada')
  const results = await db.screeningResults.where('userId').equals(userId).toArray()
  const weights = await db.weightEntries.where('userId').equals(userId).toArray()
  const anc = await db.ancVisits.where('userId').equals(userId).toArray()

  const doc = new jsPDF({ format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // watermark
  doc.setTextColor(220, 220, 220)
  doc.setFontSize(48)
  doc.text('SiKiBa — untuk keperluan medis', W / 2, H / 2, { align: 'center', angle: 30 })

  // header
  doc.setTextColor(29, 158, 117) // #1D9E75
  doc.setFontSize(18)
  doc.text('SiKiBa — Ringkasan Skrining', 14, 16)
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}  •  ${profile.nama}  •  G${profile.gravida}P${profile.para}A${profile.abortus}`, 14, 22)
  doc.line(14, 24, W - 14, 24)

  let y = 30
  // profil
  doc.setFontSize(11); doc.setTextColor(0); doc.text('Profil', 14, y); y += 6
  doc.setFontSize(9); doc.text(`Nama: ${profile.nama}  |  HPHT: ${profile.hpht}  |  Fasyankes: ${profile.fasyankes}  |  Bidan: ${profile.nama_bidan}`, 14, y); y += 8

  // skrining
  doc.setFontSize(11); doc.text(`Riwayat Skrining (${results.length})`, 14, y); y += 6
  doc.setFontSize(8)
  if (!results.length) { doc.text('- belum ada skrining -', 14, y); y += 6 }
  else {
    for (const r of results.slice(0, 12)) {
      const color: [number, number, number] = r.kategori === 'MERAH' ? [226, 75, 74] : r.kategori === 'KUNING' ? [239, 159, 39] : [29, 158, 117]
      doc.setTextColor(...color)
      doc.text(`• [${r.kategori}] ${r.tipe} — skor ${r.skor} — ${new Date(r.createdAt).toLocaleDateString('id-ID')}`, 14, y)
      y += 5; if (y > H - 20) { doc.addPage(); y = 20 }
    }
    doc.setTextColor(0)
  }
  y += 4
  // tracker
  doc.setFontSize(11); doc.text('Tracker', 14, y); y += 6
  doc.setFontSize(8)
  doc.text(`BB entries: ${weights.length}  |  ANC: ${anc.filter(a=>a.statusSelesai).length}/${anc.length} selesai`, 14, y)
  y += 10
  doc.setFontSize(7); doc.setTextColor(120); doc.text('Dokumen ini untuk dibagikan ke bidan via WhatsApp (S-08b). Bukan diagnosis — rujuk klinis tetap perlu.', 14, H - 10)

  return doc.output('blob')
}

export async function shareViaWA(userId: string): Promise<void> {
  const blob = await generateRingkasanPDF(userId)
  const file = new File([blob], `SiKiBa-${userId}.pdf`, { type: 'application/pdf' })
  // Web Share API dengan file (PWA) — fallback download
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'SiKiBa Ringkasan' })
  } else {
    // fallback wa.me teks + download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
  }
}
