import { useState } from "react"
import { Brain, HeartHandshake, Share2, ShieldCheck } from "lucide-react"
import EdukasiDetailHeader from "./EdukasiDetailHeader"

const trimesterData = [
  {
    id: 1,
    label: "Trimester 1",
    ringkasan: "Masa penyesuaian dengan perubahan awal kehamilan.",
    perasaan: "Sebagian Bunda merasakan berbagai emosi yang datang bergantian, seperti bahagia, cemas, ragu, atau takut tentang kehamilan. Rasa lelah dan mual juga dapat memengaruhi kenyamanan.",
    penyebab: "Tubuh sedang beradaptasi dengan perubahan kehamilan. Perubahan fisik dan hormon dapat turut memengaruhi suasana hati.",
    dukungan: ["Dengarkan cerita Bunda tanpa menghakimi.", "Tanyakan bantuan apa yang paling dibutuhkan.", "Bantu pekerjaan harian saat Bunda merasa lelah atau kurang nyaman."],
  },
  {
    id: 2,
    label: "Trimester 2",
    ringkasan: "Tubuh terus beradaptasi dan kedekatan dengan si Kecil dapat terasa bertambah.",
    perasaan: "Sebagian Bunda merasa lebih tenang saat keluhan awal berkurang. Perubahan bentuk tubuh atau kenaikan berat badan juga dapat memengaruhi rasa percaya diri.",
    penyebab: "Rahim membesar dan tubuh terus menyesuaikan diri. Pengalaman dan perasaan setiap Bunda dapat berbeda.",
    dukungan: ["Berikan perhatian dan apresiasi yang tulus.", "Dengarkan kekhawatiran Bunda tentang perubahan tubuh.", "Temani Bunda saat kontrol kehamilan bila memungkinkan."],
  },
  {
    id: 3,
    label: "Trimester 3",
    ringkasan: "Menjelang persalinan, rasa senang dan khawatir dapat muncul bersamaan.",
    perasaan: "Bunda mungkin bersemangat menyambut persalinan sekaligus khawatir menghadapi prosesnya atau peran baru sebagai orang tua. Perubahan fisik juga dapat mengganggu kenyamanan dan istirahat.",
    penyebab: "Persiapan persalinan dan perubahan menjelang kelahiran dapat membawa banyak pikiran dan perasaan.",
    dukungan: ["Beri ruang untuk membicarakan harapan dan kekhawatiran.", "Temani Bunda saat kontrol dan persiapan persalinan.", "Bantu menyiapkan kebutuhan ibu dan bayi bersama-sama."],
  },
] as const

export default function PsikologiScreen({ onBack, onOpenSkrining, canOpenSkrining }: { onBack: () => void; onOpenSkrining: () => void; canOpenSkrining: boolean }) {
  const [trimesterAktif, setTrimesterAktif] = useState(1)
  const [pesan, setPesan] = useState("")
  const materi = trimesterData.find((item) => item.id === trimesterAktif) ?? trimesterData[0]

  async function bagikanCatatan() {
    setPesan("")
    const text = [
      `Catatan emosi ${materi.label}`,
      `Yang mungkin dirasakan: ${materi.perasaan}`,
      `Hal yang dapat memengaruhi: ${materi.penyebab}`,
      `Dukungan yang dibutuhkan: ${materi.dukungan.join(" ")}`,
      "Catatan ini bersifat umum. Perasaan setiap Bunda dapat berbeda.",
    ].join("\n\n")
    try {
      if (navigator.share) {
        await navigator.share({ title: `Catatan emosi ${materi.label}`, text })
        return
      }
      await navigator.clipboard.writeText(text)
      setPesan("Catatan emosi disalin. Bunda dapat membagikannya kepada orang tepercaya.")
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      setPesan("Catatan belum dapat dibagikan. Coba lagi nanti.")
    }
  }

  return (
    <div className="-mx-4 -mt-5">
      <EdukasiDetailHeader nomor={6} label="Emosi Bunda" judul="Perubahan Psikologi/Emosi" deskripsi="Kenali perasaan Bunda di setiap trimester." teksBagikan="Baca materi Perubahan Psikologi dan Emosi di SIAGA Bunda." onBack={onBack} />

      <main className="relative mx-4 rounded-[32px] bg-[#FFFCF6] px-5 pb-36 pt-6">
        <section className="rounded-[20px] bg-[#EAF4F0] p-4">
          <p className="text-sm leading-relaxed text-[#33443F]">Perasaan Bunda penting untuk dirawat. Bahagia, cemas, ragu, atau lelah dapat dirasakan selama kehamilan. Setiap pengalaman berbeda, dan Bunda layak mendapat dukungan.</p>
        </section>

        <div className="mt-5" role="tablist" aria-label="Pilih trimester">
          <div className="grid grid-cols-3 rounded-full bg-[#EAF4F0] p-1">
            {trimesterData.map((item) => {
              const aktif = item.id === trimesterAktif
              return (
                <button key={item.id} id={`s06f-tab-${item.id}`} type="button" role="tab" aria-selected={aktif} aria-controls="s06f-panel" onClick={() => { setTrimesterAktif(item.id); setPesan("") }} className={`min-h-11 rounded-full px-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54] ${aktif ? "bg-[#4A6E54] text-white" : "text-[#33443F] hover:bg-white/70"}`}>
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <section id="s06f-panel" role="tabpanel" aria-labelledby={`s06f-tab-${materi.id}`} className="mt-5" key={materi.id}>
          <h2 className="text-xl font-extrabold text-[#1D2B29]">{materi.label}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#536961]">{materi.ringkasan}</p>

          <section className="mt-5 rounded-[20px] bg-white p-4 ring-1 ring-[#D9E7E2]">
            <h3 className="flex items-center gap-2 text-base font-bold text-[#1D2B29]"><Brain className="size-5 text-[#4A6E54]" aria-hidden="true" /> Yang mungkin Bunda rasakan</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#33443F]">{materi.perasaan}</p>
          </section>

          <section className="mt-3 rounded-[20px] bg-white p-4 ring-1 ring-[#D9E7E2]">
            <h3 className="text-base font-bold text-[#1D2B29]">Mengapa perasaan ini dapat muncul</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#33443F]">{materi.penyebab}</p>
          </section>

          <section className="mt-3 rounded-[20px] bg-white p-4 ring-1 ring-[#D9E7E2]">
            <h3 className="flex items-center gap-2 text-base font-bold text-[#1D2B29]"><HeartHandshake className="size-5 text-[#4A6E54]" aria-hidden="true" /> Dukungan pasangan dan keluarga</h3>
            <ul className="mt-2 space-y-2.5">
              {materi.dukungan.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#33443F]"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7AAE9A]" aria-hidden="true" /><span>{item}</span></li>)}
            </ul>
          </section>
        </section>

        <section className="mt-5 rounded-[20px] border border-[#D9E7E2] bg-white p-4">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[#1D2B29]"><ShieldCheck className="size-5 text-[#4A6E54]" aria-hidden="true" /> Kapan perlu mencari bantuan</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#33443F]">Bicarakan dengan bidan atau tenaga kesehatan jika rasa sedih, cemas, atau kewalahan terasa berat, menetap, atau mengganggu kegiatan sehari-hari. Bunda tidak harus menghadapinya sendirian.</p>
          <p className="mt-2 text-sm leading-relaxed text-[#33443F]">Jika muncul pikiran untuk menyakiti diri atau Bunda merasa tidak aman, segera beri tahu orang tepercaya dan minta bantuan tenaga kesehatan.</p>
          {canOpenSkrining ? (
            <>
              <button type="button" onClick={onOpenSkrining} className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-[#4A6E54] px-4 text-sm font-bold text-white transition-colors hover:bg-[#3D5C46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D2B29]">
                Isi skrining suasana hati EPDS
              </button>
            </>
          ) : (
            <p className="mt-3 rounded-[14px] bg-[#EAF4F0] px-3 py-2 text-xs leading-relaxed text-[#33443F]">Skrining EPDS dapat dibuka pada mode kehamilan. Untuk keluhan yang dirasakan saat ini, hubungi bidan atau tenaga kesehatan.</p>
          )}
        </section>

        <section className="mt-5 rounded-[20px] bg-[#FFF1E8] p-4">
          <h2 className="text-sm font-bold text-[#1D2B29]">Bagikan catatan emosi</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#33443F]">Bagikan ringkasan {materi.label.toLowerCase()} kepada pasangan atau orang tepercaya agar mereka memahami dukungan yang Bunda butuhkan.</p>
          <button type="button" onClick={() => void bagikanCatatan()} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-[#4A6E54] ring-1 ring-[#D9E7E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">
            <Share2 className="size-4" aria-hidden="true" /> Bagikan catatan
          </button>
          {pesan && <p role="status" className="mt-2 text-xs leading-relaxed text-[#33443F]">{pesan}</p>}
        </section>

        <button type="button" onClick={() => { onBack(); window.scrollTo({ top: 0, behavior: "smooth" }) }} className="mt-5 min-h-11 w-full rounded-full text-sm font-semibold text-[#4A6E54] ring-1 ring-[#D9E7E2] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">
          Kembali ke materi
        </button>
      </main>
    </div>
  )
}
