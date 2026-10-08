import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Search, ShieldAlert, TriangleAlert, Video } from "lucide-react"

const kelompok = ["Ibu dan janin", "Kondisi tubuh", "Kesehatan jiwa"] as const
type Kelompok = (typeof kelompok)[number]

const tanda: { id: string; kelompok: Kelompok; judul: string; ringkasan: string; penjelasan: string; tindakan: string; video: string }[] = [
  { id: "perdarahan", kelompok: "Ibu dan janin", judul: "Perdarahan saat hamil", ringkasan: "Perdarahan dari jalan lahir perlu segera diperiksa.", penjelasan: "Perdarahan saat kehamilan dapat memerlukan penilaian tenaga kesehatan.", tindakan: "Segera hubungi bidan atau dokter, atau datang ke fasilitas kesehatan. Jangan menunggu perdarahan bertambah.", video: "/s-06/s-06e/perdarahan.mp4" },
  { id: "gerakan-janin", kelompok: "Ibu dan janin", judul: "Gerakan janin berkurang", ringkasan: "Gerakan yang lebih sedikit atau berubah dari pola biasanya perlu diperhatikan.", penjelasan: "Janin dapat beristirahat, tetapi perubahan gerakan juga dapat menjadi tanda bahwa janin perlu diperiksa.", tindakan: "Segera hubungi bidan atau dokter untuk mendapat arahan. Jangan menunda pemeriksaan bila gerakan tidak terasa atau terus berkurang.", video: "/s-06/s-06e/gerakan%20janin%20berkurang.mp4" },
  { id: "nyeri-perut", kelompok: "Ibu dan janin", judul: "Nyeri perut hebat", ringkasan: "Nyeri perut yang hebat, mendadak, atau menetap perlu diperiksa.", penjelasan: "Nyeri perut memiliki beragam penyebab dan perlu dinilai sesuai kondisi Bunda.", tindakan: "Hubungi bidan atau dokter dan ikuti arahan untuk pemeriksaan segera.", video: "/s-06/s-06e/nyeri%20perut.mp4" },
  { id: "nyeri-ulu-hati", kelompok: "Ibu dan janin", judul: "Nyeri ulu hati", ringkasan: "Nyeri ulu hati yang berat, terutama bersama gejala lain, perlu segera diperiksa.", penjelasan: "Nyeri ulu hati dapat menjadi salah satu keluhan yang memerlukan penilaian, khususnya bila disertai sakit kepala berat atau pandangan kabur.", tindakan: "Segera hubungi bidan atau dokter untuk mendapat pemeriksaan.", video: "/s-06/s-06e/nyeri%20ulu%20hati.mp4" },
  { id: "ketuban", kelompok: "Ibu dan janin", judul: "Cairan ketuban merembes atau pecah", ringkasan: "Cairan yang keluar dari jalan lahir sebelum persalinan perlu segera diperiksa.", penjelasan: "Cairan ketuban dapat merembes sedikit demi sedikit atau keluar sekaligus. Pemeriksaan membantu tenaga kesehatan menentukan langkah yang sesuai.", tindakan: "Segera hubungi bidan atau dokter dan datang ke fasilitas kesehatan.", video: "/s-06/s-06e/ketuban%20pecah.mp4" },
  { id: "nyeri-kepala", kelompok: "Ibu dan janin", judul: "Sakit kepala hebat", ringkasan: "Sakit kepala hebat, terutama bersama pandangan kabur, perlu segera diperiksa.", penjelasan: "Sakit kepala berat dapat menjadi tanda kondisi yang memerlukan penilaian tenaga kesehatan.", tindakan: "Segera hubungi bidan atau dokter. Jangan mencoba mengatasi sendiri dengan obat tanpa arahan tenaga kesehatan.", video: "/s-06/s-06e/nyeri%20kepala.mp4" },
  { id: "pandangan-kabur", kelompok: "Ibu dan janin", judul: "Pandangan kabur", ringkasan: "Pandangan kabur, terlebih bersama sakit kepala atau nyeri ulu hati, perlu segera diperiksa.", penjelasan: "Perubahan penglihatan selama kehamilan perlu disampaikan kepada bidan atau dokter.", tindakan: "Segera hubungi bidan atau dokter untuk pemeriksaan.", video: "/s-06/s-06e/pandangan%20kabur.mp4" },
  { id: "demam", kelompok: "Kondisi tubuh", judul: "Demam", ringkasan: "Demam tinggi atau demam yang menetap perlu diperiksa.", penjelasan: "Demam dapat berkaitan dengan infeksi dan perlu dinilai sesuai kondisi Bunda.", tindakan: "Hubungi bidan atau dokter untuk mendapat arahan pemeriksaan dan perawatan.", video: "/s-06/s-06e/demam.mp4" },
  { id: "napas-pendek", kelompok: "Kondisi tubuh", judul: "Sesak napas", ringkasan: "Sesak napas, napas terengah-engah, atau nyeri dada perlu diperiksa.", penjelasan: "Keluhan napas yang berat atau disertai nyeri dada memerlukan penilaian tenaga kesehatan.", tindakan: "Segera minta bantuan orang terdekat dan hubungi fasilitas kesehatan.", video: "/s-06/s-06e/napas%20pendek.mp4" },
  { id: "jantung-berdebar", kelompok: "Kondisi tubuh", judul: "Jantung berdebar disertai nyeri dada", ringkasan: "Berdebar keras atau disertai nyeri dada perlu diperiksa.", penjelasan: "Beri tahu tenaga kesehatan kapan keluhan mulai terasa dan gejala lain yang menyertainya.", tindakan: "Hubungi bidan atau dokter untuk mendapat pemeriksaan.", video: "/s-06/s-06e/jantung%20berdebar.mp4" },
  { id: "kesehatan-jiwa", kelompok: "Kesehatan jiwa", judul: "Kesulitan menjaga kesehatan jiwa", ringkasan: "Rasa sedih, cemas, atau sulit beraktivitas yang menetap layak mendapat dukungan.", penjelasan: "Perubahan perasaan dapat terjadi selama kehamilan. Bunda tidak harus menghadapinya sendiri.", tindakan: "Ceritakan kepada orang tepercaya dan hubungi bidan. Jika ada pikiran menyakiti diri, segera minta bantuan orang terdekat dan tenaga kesehatan.", video: "/s-06/s-06e/masalah%20kejiwaan.mp4" },
]

function TandaCard({ item, terbuka, onToggle }: { item: (typeof tanda)[number]; terbuka: boolean; onToggle: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [autoplayGagal, setAutoplayGagal] = useState(false)

  useEffect(() => {
    if (!terbuka) return
    setAutoplayGagal(false)
    void video.current?.play().catch(() => setAutoplayGagal(true))
  }, [terbuka])

  return (
    <article className="overflow-hidden rounded-[20px] bg-white ring-1 ring-[#D9E7E2]">
      <button
        type="button"
        aria-expanded={terbuka}
        aria-controls={`tanda-${item.id}`}
        onClick={onToggle}
        className="flex min-h-[76px] w-full items-center gap-3 p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4A6E54]"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#FFF1E8] text-[#7A4310]"><TriangleAlert className="size-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[#1D2B29]">{item.judul}</span>
          <span className="mt-1 block text-xs leading-relaxed text-[#536961]">{item.ringkasan}</span>
        </span>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#EAF4F0] text-[#4A6E54]" aria-hidden="true"><Video className="size-4" /></span>
      </button>
      {terbuka && (
        <div id={`tanda-${item.id}`} className="border-t border-[#D9E7E2] p-3.5">
          <video ref={video} controls autoPlay muted playsInline preload="metadata" className="w-full rounded-[14px] bg-black" aria-label={`Video ${item.judul}`}>
            <source src={item.video} type="video/mp4" />
            Browser Bunda tidak mendukung pemutaran video.
          </video>
          {autoplayGagal && <p className="mt-2 text-xs text-[#536961]">Video belum diputar otomatis. Ketuk tombol putar untuk memulai.</p>}
          <h3 className="mt-4 text-sm font-extrabold text-[#C62828]">Penjelasan gejala</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#33443F]">{item.penjelasan}</p>
          <h3 className="mt-4 text-sm font-extrabold text-[#C62828]">Anjuran tindakan</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#33443F]">{item.tindakan}</p>
          <div className="mt-4 rounded-[16px] bg-[#FFE2E2] p-3.5 text-sm font-semibold leading-relaxed text-[#8E2424]">
            Jika Bunda mengalami gejala ini, segera hubungi bidan atau fasilitas kesehatan terdekat. Jangan menunggu gejala memburuk.
          </div>
        </div>
      )}
    </article>
  )
}

export default function TandaBahayaScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("")
  const [terbuka, setTerbuka] = useState<string | null>(null)
  const cari = query.trim().toLocaleLowerCase("id-ID")
  const hasil = tanda.filter((item) => `${item.judul} ${item.ringkasan} ${item.penjelasan}`.toLocaleLowerCase("id-ID").includes(cari))

  return (
    <div className="-mx-4 -mt-5">
      <header className="rounded-b-[32px] bg-[#4A6E54] px-5 pb-11 pt-6 text-white">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { onBack(); window.scrollTo({ top: 0, behavior: "smooth" }) }} aria-label="Kembali ke materi edukasi" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/12 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="!m-0 text-xl font-extrabold leading-tight">Tanda Bahaya Kehamilan</h1>
            <p className="mt-1 text-sm leading-relaxed text-white/90">Kenali gejala yang perlu segera diperiksa.</p>
          </div>
          <img src="/s-06/s-06e/Thumbnail.webp" alt="" aria-hidden="true" className="h-[76px] w-[76px] shrink-0 rounded-[16px] bg-[#FFFDEC] object-cover sm:h-[88px] sm:w-[104px]" />
        </div>
      </header>

      <main className="relative mx-4 -mt-7 rounded-t-[32px] bg-[#FFFCF6] px-5 pb-36 pt-6">
        <div className="flex items-start gap-3 rounded-[20px] bg-[#FFE2E2] p-4 text-[#8E2424]">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold leading-relaxed">Jika Bunda mengalami salah satu gejala di bawah ini, segera hubungi bidan atau dokter. Jangan menunggu gejala memburuk.</p>
        </div>

        <label className="relative mt-5 block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#536961]" aria-hidden="true" />
          <span className="sr-only">Cari tanda bahaya</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Cari gejala" className="min-h-12 w-full rounded-full border border-[#D9E7E2] bg-white pl-11 pr-4 text-sm text-[#1D2B29] outline-none placeholder:text-[#536961] focus-visible:ring-2 focus-visible:ring-[#4A6E54]" />
        </label>

        {query && <p aria-live="polite" className="mt-3 text-xs font-semibold text-[#536961]">{hasil.length} gejala ditemukan</p>}

        <div className="mt-6 space-y-6">
          {kelompok.map((nama) => {
            const daftar = hasil.filter((item) => item.kelompok === nama)
            if (!daftar.length) return null
            return (
              <section key={nama} aria-label={nama}>
                <h2 className="mb-2 text-sm font-bold text-[#536961]">{nama}</h2>
                <div className="space-y-2.5">
                  {daftar.map((item) => <TandaCard key={item.id} item={item} terbuka={terbuka === item.id} onToggle={() => setTerbuka((current) => current === item.id ? null : item.id)} />)}
                </div>
              </section>
            )
          })}
          {!hasil.length && <p className="rounded-[18px] bg-white p-4 text-sm text-[#536961]">Gejala tidak ditemukan. Jika Bunda merasa khawatir, hubungi bidan atau dokter.</p>}
        </div>

        <div className="mt-6 rounded-[18px] bg-white p-4 text-xs leading-relaxed text-[#536961] ring-1 ring-[#D9E7E2]">
          Materi ini membantu Bunda mengenali gejala dan tidak menggantikan pemeriksaan tenaga kesehatan. Keluhan nifas dan menyusui dibahas pada materi nifas dan laktasi.
        </div>
      </main>
    </div>
  )
}
