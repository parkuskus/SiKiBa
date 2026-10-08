import {
  Activity,
  ArrowRight,
  Baby,
  Brain,
  Dna,
  HeartPulse,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react"

const topik = [
  { judul: "Terjadinya Kehamilan (Fertilisasi)", keterangan: "Dari sel telur hingga implantasi", icon: Dna, thumbnail: "/s-06/s-06a/Thumbnail.webp", screen: "fertilisasi" },
  { judul: "Perkembangan Janin per Minggu", keterangan: "Ikuti tumbuh kembang dari minggu ke minggu", icon: Baby, thumbnail: "/s-06/s-06b/Thumbnail.webp", screen: "janin" },
  { judul: "Perkembangan Plasenta, Tali Pusat, dan Ketuban", keterangan: "Kenali fungsi organ pendukung kehamilan", icon: Activity, thumbnail: "/s-06/s-06c/Thumbnail.webp", screen: "s06c" },
  { judul: "Perubahan Fisiologi Kehamilan", keterangan: "Adaptasi tubuh selama kehamilan", icon: HeartPulse, thumbnail: "/s-06/s-06d/Thumbnail.webp", screen: "fisiologi" },
  { judul: "Tanda Bahaya Kehamilan", keterangan: "Kenali gejala yang perlu diperiksa", icon: ShieldAlert },
  { judul: "Perubahan Psikologi/Emosi", keterangan: "Perubahan perasaan tiap trimester", icon: Brain, thumbnail: "/s-06/s-06f/Thumbnail.png" },
] satisfies { judul: string; keterangan: string; icon: LucideIcon; thumbnail?: string; screen?: "fertilisasi" | "janin" | "s06c" | "fisiologi" }[]

type Props = { onOpenFertilisasi: () => void; onOpenJanin: () => void; onOpenPlasenta: () => void; onOpenFisiologi: () => void }

export default function EdukasiMenuScreen({ onOpenFertilisasi, onOpenJanin, onOpenPlasenta, onOpenFisiologi }: Props) {
  return (
    <div className="-mx-4 -mt-5">
      <header className="relative isolate overflow-hidden rounded-b-[32px] bg-[#4A6E54] px-6 pb-11 pt-7 text-white">
        <div className="relative z-10 max-w-[210px]">
          <h1 className="!m-0 text-[28px] font-extrabold leading-tight">Belajar</h1>
          <div className="mt-2 text-sm leading-relaxed text-white/90">Kenali kehamilan dan siapkan langkah Bunda bersama si Kecil.</div>
        </div>
        <img
          src="/illu/illu-08-diary.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 bottom-0 h-[138px] w-[140px] object-contain object-bottom"
        />
      </header>

      <section className="relative mx-4 -mt-7 min-h-[calc(100dvh-190px)] rounded-t-[32px] bg-[#FFFCF6] px-5 pb-8 pt-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#1D2B29]">Materi kehamilan</h2>
          <div className="mt-1 text-sm leading-relaxed text-[#536961]">Pilih topik yang ingin Bunda pelajari.</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {topik.map(({ judul, keterangan, icon: Icon, thumbnail, screen }, index) => {
            const siap = Boolean(screen)
            const bukaTopik = screen === "fertilisasi" ? onOpenFertilisasi : screen === "janin" ? onOpenJanin : screen === "s06c" ? onOpenPlasenta : onOpenFisiologi
            const isiTile = (
              <>
                <span className={`grid h-[92px] place-items-center overflow-hidden rounded-[18px] ${index % 2 === 0 ? "bg-[#EAF4F0]" : "bg-[#FFF1E8]"}`}>
                  {thumbnail ? (
                    <img src={thumbnail} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="size-9 text-[#4A6E54]" strokeWidth={1.7} aria-hidden="true" />
                  )}
                </span>
                <span className="mt-3 block text-[13px] font-bold leading-snug text-[#1D2B29]">{judul}</span>
                <span className="mt-1 block text-xs leading-relaxed text-[#536961]">{keterangan}</span>
                <span className={`mt-3 inline-flex min-h-8 items-center gap-1.5 self-start rounded-full px-3 text-xs font-bold ${siap ? "bg-[#4A6E54] text-white" : "bg-white text-[#536961] ring-1 ring-[#D9E7E2]"}`}>
                  {siap ? "Baca materi" : "Segera hadir"}
                  {siap && <ArrowRight className="size-3.5" aria-hidden="true" />}
                </span>
              </>
            )

            return siap ? (
              <button
                key={judul}
                type="button"
                onClick={bukaTopik}
                className="flex min-h-[210px] flex-col rounded-[24px] bg-white p-3.5 text-left ring-1 ring-[#D9E7E2] transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]"
              >
                {isiTile}
              </button>
            ) : (
              <div key={judul} className="flex min-h-[210px] flex-col rounded-[24px] bg-white p-3.5 ring-1 ring-[#D9E7E2]">
                {isiTile}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
