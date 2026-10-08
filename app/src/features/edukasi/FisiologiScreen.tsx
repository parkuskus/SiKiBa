import { useMemo, useState } from "react"
import { ArrowLeft, ChevronDown, Search, X } from "lucide-react"
import { fisiologiGroups, fisiologiSystems } from "./fisiologiData"
import EdukasiDetailHeader from "./EdukasiDetailHeader"

export default function FisiologiScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
  const filteredSystems = useMemo(() => {
    if (!normalizedQuery) return fisiologiSystems
    return fisiologiSystems.filter((system) =>
      [system.title, system.summary, system.details, ...system.terms]
        .join(" ")
        .toLocaleLowerCase("id-ID")
        .includes(normalizedQuery),
    )
  }, [normalizedQuery])

  return (
    <div className="-mx-4 -mt-5">
      <EdukasiDetailHeader nomor={4} label="Fisiologi Kehamilan" judul="Perubahan Fisiologi Kehamilan" deskripsi="Kenali adaptasi tubuh Bunda selama kehamilan." teksBagikan="Baca materi Perubahan Fisiologi Kehamilan di SIAGA Bunda." onBack={onBack} />

      <main className="relative mx-4 rounded-[32px] bg-[#FFFCF6] px-5 pb-36 pt-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1D2B29]">11 sistem tubuh</h2>
            <div className="mt-1 text-sm leading-relaxed text-[#536961]">Pilih bagian untuk membaca perubahannya.</div>
          </div>
          <span className="shrink-0 rounded-full bg-[#EAF4F0] px-3 py-1.5 text-xs font-bold text-[#4A6E54]">11 topik</span>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#536961]" aria-hidden="true" />
          <span className="sr-only">Cari perubahan tubuh</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari perubahan tubuh"
            className="min-h-12 w-full rounded-full border border-[#D9E7E2] bg-white pl-11 pr-11 text-sm text-[#1D2B29] outline-none placeholder:text-[#536961] focus-visible:ring-2 focus-visible:ring-[#4A6E54]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              className="absolute right-1 top-1 grid size-10 place-items-center rounded-full text-[#536961] hover:bg-[#EAF4F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </label>

        {normalizedQuery && (
          <div aria-live="polite" className="mt-3 text-xs font-semibold text-[#536961]">
            {filteredSystems.length} hasil pencarian
          </div>
        )}

        <div className="mt-5 space-y-6">
          {fisiologiGroups.map((group) => {
            const systems = filteredSystems.filter((system) => system.group === group)
            if (!systems.length) return null

            return (
              <section key={group} aria-label={group}>
                <h3 className="mb-2 text-sm font-bold text-[#536961]">{group}</h3>
                <div className="divide-y divide-[#D9E7E2] rounded-[22px] bg-white px-3.5 ring-1 ring-[#D9E7E2]">
                  {systems.map((system) => {
                    const expanded = openId === system.id
                    const detailsId = `fisiologi-${system.id}`

                    return (
                      <article key={system.id} className="py-2">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={detailsId}
                          onClick={() => setOpenId((current) => current === system.id ? null : system.id)}
                          className="flex min-h-[68px] w-full items-center gap-3 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4A6E54]"
                        >
                          <span className="grid size-[52px] shrink-0 place-items-center overflow-hidden rounded-[14px] bg-[#FFFDEC]">
                            <img src={system.image} alt="" aria-hidden="true" className="size-full object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold leading-snug text-[#1D2B29]">{system.title}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-[#536961]">{system.summary}</span>
                          </span>
                          <ChevronDown className={`size-5 shrink-0 text-[#536961] transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
                        </button>

                        {expanded && (
                          <div id={detailsId} className="pb-3 pt-2">
                            <img src={system.image} alt={`Ilustrasi ${system.title.toLocaleLowerCase("id-ID")}`} className="mx-auto max-h-[184px] w-full rounded-[18px] bg-[#FFFDEC] object-contain" />
                            <div className="mt-4 rounded-[16px] bg-[#EAF4F0] p-3.5">
                              <div className="text-xs font-bold text-[#4A6E54]">Yang berubah</div>
                              <div className="mt-1.5 text-sm leading-relaxed text-[#33443F]">{system.details}</div>
                            </div>
                            {system.tip && (
                              <div className="mt-2.5 rounded-[16px] bg-[#FFF1E8] p-3.5">
                                <div className="text-xs font-bold text-[#7A4310]">Tips dari materi</div>
                                <div className="mt-1.5 text-sm leading-relaxed text-[#5E452E]">{system.tip}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {!filteredSystems.length && (
            <div className="rounded-[20px] bg-white px-5 py-8 text-center ring-1 ring-[#D9E7E2]">
              <div className="text-sm font-bold text-[#1D2B29]">Topik belum ditemukan</div>
              <div className="mt-1 text-sm text-[#536961]">Coba kata lain, seperti “sembelit” atau “sering berkemih”.</div>
            </div>
          )}
        </div>

        <aside className="mt-6 rounded-[18px] bg-[#FFF1E8] p-4 text-sm leading-relaxed text-[#5E452E]">
          Informasi ini menjelaskan perubahan tubuh yang dapat terjadi. Bila keluhan terasa berat atau memburuk, konsultasikan kepada bidan atau dokter.
        </aside>

        <details className="mt-5 rounded-[18px] bg-white px-4 py-3 ring-1 ring-[#D9E7E2]">
          <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold text-[#33443F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">Sumber materi</summary>
          <div className="pb-2 text-xs leading-relaxed text-[#536961]">Materi dirangkum dari dokumen edukasi proyek dan ekstraksi prototype SiKiBa. Angka, saran, dan klaim klinis perlu ditinjau tenaga kesehatan sebelum dipublikasikan.</div>
        </details>

        <button
          type="button"
          onClick={() => { onBack(); window.scrollTo({ top: 0, behavior: "smooth" }) }}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-[#4A6E54] ring-1 ring-[#D9E7E2] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke materi
        </button>
      </main>
    </div>
  )
}
