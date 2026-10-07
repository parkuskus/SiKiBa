import { useState } from "react"
import { ArrowLeft, ArrowRight, BookOpen, Play, Share2, Stethoscope } from "lucide-react"

const tahapFertilisasi = [
  {
    judul: "Ovulasi",
    gambar: "/s-06/s-06a/1-Ovulasi.webp",
    alt: "Sel telur dilepaskan dari ovarium dan bergerak menuju tuba falopi",
    isi: "Sel telur dilepaskan dari ovarium dan bergerak ke tuba falopi. Di sinilah perjalanan menuju pembuahan dimulai.",
  },
  {
    judul: "Perjalanan sperma",
    gambar: "/s-06/s-06a/2-Perjalanan%20sperma.webp",
    alt: "Sperma bergerak menuju sel telur di tuba falopi",
    isi: "Sperma bergerak melalui saluran reproduksi menuju sel telur. Pertemuan keduanya dapat terjadi di tuba falopi.",
  },
  {
    judul: "Fertilisasi",
    gambar: "/s-06/s-06a/3-Fertilisasi.webp",
    alt: "Satu sperma menembus sel telur dan memulai proses pembuahan",
    isi: "Satu sperma membuahi sel telur dan membentuk zigot. Zigot membawa materi genetik dari ibu dan ayah.",
  },
  {
    judul: "Pembelahan zigot",
    gambar: "/s-06/s-06a/4-Pembelahan%20zigot.webp",
    alt: "Zigot membelah menjadi dua, empat, delapan, lalu lebih banyak sel",
    isi: "Zigot membelah menjadi beberapa sel sambil bergerak ke rahim. Kumpulan sel ini berkembang menjadi morula dan blastokista.",
  },
  {
    judul: "Implantasi",
    gambar: "/s-06/s-06a/5-Implantasi.webp",
    alt: "Blastokista pada tahap awal sebelum melekat pada lapisan dalam rahim",
    isi: "Blastokista menempel pada lapisan dalam rahim. Proses penempelan ini disebut implantasi.",
  },
] as const

const videoFertilisasi = "https://youtu.be/_5OvgQW6FG4?si=sl7BZofIK3tihY_T"

function BagikanMateri() {
  const [pesan, setPesan] = useState("")

  async function bagikan() {
    const data = {
      title: "Terjadinya Kehamilan",
      url: new URL("?tab=edukasi", window.location.href).toString(),
      text: "Baca materi Terjadinya Kehamilan di SIAGA Bunda.",
    }
    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
      await navigator.clipboard.writeText(data.url)
      setPesan("Tautan materi disalin.")
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      setPesan("Tautan belum dapat dibagikan. Coba lagi nanti.")
    }
  }

  return (
    <div className="relative flex flex-col items-end">
      <button
        type="button"
        onClick={() => void bagikan()}
        aria-label="Bagikan materi fertilisasi"
        className="grid size-11 shrink-0 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Share2 className="size-5" aria-hidden="true" />
      </button>
      {pesan && <span role="status" className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-max rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#33443F] shadow-sm">{pesan}</span>}
    </div>
  )
}

export default function FertilisasiScreen({ onBack }: { onBack: () => void }) {
  const [tahapAktif, setTahapAktif] = useState(0)
  const tahap = tahapFertilisasi[tahapAktif]

  return (
    <div className="-mx-4 -mt-5">
      <header className="rounded-b-[32px] bg-[#4A6E54] px-5 pb-11 pt-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => { onBack(); window.scrollTo({ top: 0, behavior: "smooth" }) }}
            aria-label="Kembali ke materi edukasi"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white/12 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <div className="text-xs font-semibold text-white/80">Materi 1</div>
            <div className="mt-0.5 truncate text-sm font-bold">Fertilisasi</div>
          </div>
          <BagikanMateri />
        </div>
        <div className="mt-5 max-w-[320px]">
          <h1 className="!m-0 text-[26px] font-extrabold leading-tight">Terjadinya kehamilan</h1>
          <div className="mt-2 text-sm leading-relaxed text-white/90">Kenali perjalanan sel telur hingga awal kehamilan.</div>
        </div>
      </header>

      <main className="relative mx-4 mt-4 rounded-[32px] bg-[#FFFCF6] px-5 pb-36 pt-6">
        <section aria-label="Tahap fertilisasi" className="rounded-[24px] bg-white p-4 ring-1 ring-[#D9E7E2]">
          <div className="flex items-center justify-between gap-2" role="group" aria-label="Pilih tahap fertilisasi">
            {tahapFertilisasi.map((item, index) => {
              const aktif = index === tahapAktif
              return (
                <button
                  key={item.judul}
                  type="button"
                  aria-label={`Tahap ${index + 1}: ${item.judul}`}
                  aria-pressed={aktif}
                  onClick={() => setTahapAktif(index)}
                  className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54] focus-visible:ring-offset-2 ${aktif ? "bg-[#4A6E54] text-white" : "bg-[#EAF4F0] text-[#33443F] hover:bg-[#DFF0EA]"}`}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-5 text-center text-xs font-semibold text-[#536961]">Tahap {tahapAktif + 1} dari {tahapFertilisasi.length}</div>
          <h2 aria-live="polite" className="mt-1 text-center text-xl font-extrabold text-[#1D2B29]">{tahap.judul}</h2>
          <div className="mt-4 overflow-hidden rounded-[20px] bg-[#FFFDEC]">
            <img key={tahap.gambar} src={tahap.gambar} alt={tahap.alt} className="h-[200px] w-full object-contain sm:h-[230px]" />
          </div>
          <div className="mt-2 text-center text-xs text-[#536961]">
            {tahapAktif === 4 ? "Ilustrasi blastokista" : `Ilustrasi ${tahap.judul.toLowerCase()}`}
          </div>
          <div aria-live="polite" className="mt-4 text-[15px] leading-relaxed text-[#33443F]">{tahap.isi}</div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setTahapAktif((current) => Math.max(0, current - 1))}
              disabled={tahapAktif === 0}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#33443F] transition-colors hover:bg-[#EAF4F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54] disabled:opacity-40"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setTahapAktif((current) => Math.min(tahapFertilisasi.length - 1, current + 1))}
              disabled={tahapAktif === tahapFertilisasi.length - 1}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#4A6E54] px-4 text-sm font-bold text-white transition-colors hover:bg-[#3D5C46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54] focus-visible:ring-offset-2 disabled:opacity-40"
            >
              Berikutnya <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-bold text-[#1D2B29]">Tanda awal</h2>
          <div className="mt-1 text-sm leading-relaxed text-[#536961]">Beberapa perubahan yang dapat mendorong Bunda untuk melakukan pemeriksaan.</div>
          <ul className="mt-3 space-y-2.5">
            {["Haid terlambat", "Mual", "Cepat lelah"].map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 ring-1 ring-[#D9E7E2]">
                <span className="size-2 shrink-0 rounded-full bg-[#7AAE9A]" />
                <span className="text-sm text-[#33443F]">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-[18px] bg-[#EAF4F0] p-4 text-sm leading-relaxed text-[#33443F]">
            Tanda awal tidak dapat memastikan kehamilan. Lakukan tes dan konsultasikan hasilnya kepada bidan atau dokter.
          </div>
        </section>

        <section className="mt-7 rounded-[24px] bg-white p-4 ring-1 ring-[#D9E7E2]">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-full bg-[#EAF4F0] text-[#4A6E54]">
              <Stethoscope className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-bold text-[#1D2B29]">Langkah selanjutnya</h2>
          </div>
          <div className="mt-3 text-sm leading-relaxed text-[#33443F]">
            Setelah tes kehamilan menunjukkan hasil positif, jadwalkan pemeriksaan dengan bidan atau dokter untuk membahas usia kehamilan dan perawatan berikutnya.
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-bold text-[#1D2B29]">Video fertilisasi</h2>
          <div className="mt-1 text-sm text-[#536961]">Tonton penjelasan singkat tentang proses pembuahan.</div>
          <a
            href={videoFertilisasi}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex min-h-[76px] items-center gap-3 rounded-[20px] bg-white p-4 ring-1 ring-[#D9E7E2] transition-colors hover:bg-[#EAF4F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#4A6E54] text-white">
              <Play className="size-5 fill-current" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#1D2B29]">Tonton di YouTube</span>
              <span className="mt-0.5 block text-xs text-[#536961]">Video tentang fertilisasi</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-[#4A6E54]" aria-hidden="true" />
          </a>
        </section>

        <details className="mt-6 rounded-[18px] bg-white px-4 py-3 ring-1 ring-[#D9E7E2]">
          <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold text-[#33443F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">Sumber materi</summary>
          <div className="pb-2 text-xs leading-relaxed text-[#536961]">Referensi yang tercantum pada prototype: Kemenkes RI Buku KIA 2024, WHO Reproductive Health, dan FIGO 2020. Tinjau kembali rujukan dan isi klinis sebelum publikasi.</div>
        </details>

        <button
          type="button"
          onClick={() => { onBack(); window.scrollTo({ top: 0, behavior: "smooth" }) }}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-[#4A6E54] ring-1 ring-[#D9E7E2] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]"
        >
          <BookOpen className="size-4" aria-hidden="true" /> Kembali ke materi
        </button>
      </main>
    </div>
  )
}
