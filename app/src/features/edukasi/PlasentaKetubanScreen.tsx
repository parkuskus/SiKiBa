import { useState } from "react"
import { ArrowLeft, CircleHelp, Droplets, Shield, Thermometer, Wind } from "lucide-react"
import EdukasiDetailHeader from "./EdukasiDetailHeader"

type Props = { onBack: () => void }
type TabId = "ketuban" | "tali-pusat" | "plasenta"
type Surface = "janin" | "ibu"

const tabs: { id: TabId; label: string }[] = [
  { id: "ketuban", label: "Ketuban" },
  { id: "tali-pusat", label: "Tali pusat" },
  { id: "plasenta", label: "Plasenta" },
]

const fungsiKetuban = [
  { icon: Shield, title: "Proteksi dan trauma", description: "Membantu mencegah benturan langsung dan perlekatan janin pada selaput amnion." },
  { icon: Wind, title: "Ruang gerak", description: "Memberi ruang agar janin dapat bergerak di dalam rahim." },
  { icon: Thermometer, title: "Regulasi suhu", description: "Membantu menjaga suhu di sekitar janin tetap stabil." },
  { icon: Droplets, title: "Membantu persalinan", description: "Membantu pembukaan serviks saat proses persalinan." },
  { icon: Droplets, title: "Membersihkan jalan lahir", description: "Membantu membersihkan jalan lahir saat ketuban pecah." },
]

const insersi = [
  { title: "Sentralis", detail: "Tali pusat menempel di bagian tengah plasenta." },
  { title: "Parasentralis", detail: "Tali pusat menempel sedikit bergeser dari tengah." },
  { title: "Lateralis", detail: "Tali pusat menempel di sisi plasenta." },
  { title: "Marginalis", detail: "Tali pusat menempel di tepi plasenta." },
  { title: "Velamentosa", detail: "Pembuluh darah berjalan pada selaput sebelum mencapai plasenta dan perlu dinilai tenaga kesehatan." },
]

const fungsiPlasenta = [
  { title: "Nutrisi dan respirasi", description: "Membantu menyalurkan zat makanan dan oksigen serta mengeluarkan karbon dioksida." },
  { title: "Ekskresi", description: "Membantu mengalirkan sisa metabolisme janin ke sirkulasi ibu." },
  { title: "Hormon", description: "Menghasilkan hormon yang berperan selama kehamilan." },
  { title: "Imunitas dan barier", description: "Membantu menyalurkan antibodi ibu dan menjadi barier terhadap sebagian zat." },
]

export default function PlasentaKetubanScreen({ onBack }: Props) {
  const [tab, setTab] = useState<TabId>("ketuban")
  const [surface, setSurface] = useState<Surface>("janin")

  return (
    <div className="-mx-4 -mt-5">
      <EdukasiDetailHeader nomor={3} label="Organ Pendukung" judul="Perkembangan Plasenta, Tali Pusat, dan Ketuban" deskripsi="Kenali fungsi organ pendukung kehamilan." teksBagikan="Baca materi tentang plasenta, tali pusat, dan ketuban di SIAGA Bunda." onBack={onBack} />

      <main className="relative mx-4 rounded-[32px] bg-[#FFFCF6] px-5 pb-36 pt-6">
        <div role="tablist" aria-label="Pilih materi" className="grid grid-cols-3 rounded-full bg-[#EAF4F0] p-1">
          {tabs.map((item) => {
            const active = item.id === tab
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`s06c-tab-${item.id}`}
                aria-selected={active}
                aria-controls="s06c-panel"
                onClick={() => setTab(item.id)}
                className={`min-h-11 rounded-full px-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54] ${active ? "bg-[#4A6E54] text-white" : "text-[#33443F] hover:bg-white/70"}`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <section id="s06c-panel" role="tabpanel" aria-labelledby={`s06c-tab-${tab}`} className="mt-5">
          {tab === "ketuban" && (
            <>
              <div className="text-sm leading-relaxed text-[#33443F]">Cairan amnion mengelilingi janin dan memberi ruang untuk bergerak di dalam rahim.</div>
              <img
                src="/s-06/s-06c/ketuban.webp"
                alt="Potongan rahim yang memperlihatkan janin di dalam kantung amnion dan cairan ketuban"
                className="mt-4 aspect-[4/3] w-full rounded-[20px] bg-[#FFFDEC] object-contain"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#EAF4F0] px-3 py-2 text-xs font-bold text-[#33443F]">Pucat jernih</span>
                <span className="rounded-full bg-[#EAF4F0] px-3 py-2 text-xs font-bold text-[#33443F]">Sekitar 99% air</span>
                <span className="rounded-full bg-[#EAF4F0] px-3 py-2 text-xs font-bold text-[#33443F]">Puncak sekitar 1 liter pada minggu ke-38</span>
              </div>

              <SectionHeading className="mt-7">Fungsi ketuban</SectionHeading>
              <ul className="mt-3 divide-y divide-[#D9E7E2] rounded-[20px] bg-white px-4 ring-1 ring-[#D9E7E2]">
                {fungsiKetuban.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex items-start gap-3 py-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EAF4F0] text-[#4A6E54]">
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-[#1D2B29]">{title}</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-[#536961]">{description}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <InfoNote title="Perlu diperiksa">
                Jika ada cairan merembes dari jalan lahir sebelum waktunya, hubungi bidan atau dokter untuk mendapat arahan.
              </InfoNote>
            </>
          )}

          {tab === "tali-pusat" && (
            <>
              <div className="text-sm leading-relaxed text-[#33443F]">Tali pusat menghubungkan janin dengan plasenta. Di dalamnya terdapat tiga pembuluh darah yang dilindungi jeli Wharton.</div>
              <img
                src="/s-06/s-06c/tali-pusat.webp"
                alt="Tali pusat menghubungkan janin dengan plasenta, dengan penampang tiga pembuluh di dalam jeli Wharton"
                className="mt-4 aspect-[4/3] w-full rounded-[20px] bg-[#FFFDEC] object-contain"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#EAF4F0] px-3 py-2 text-xs font-bold text-[#33443F]">Panjang sekitar 55 cm</span>
                <span className="rounded-full bg-[#EAF4F0] px-3 py-2 text-xs font-bold text-[#33443F]">Diameter 1–2 cm</span>
                <span className="rounded-full bg-[#EAF4F0] px-3 py-2 text-xs font-bold text-[#33443F]">Dua arteri dan satu vena</span>
              </div>

              <SectionHeading className="mt-7">Tiga pembuluh darah</SectionHeading>
              <ul className="mt-3 space-y-2.5">
                <li className="rounded-[18px] bg-white p-4 ring-1 ring-[#D9E7E2]">
                  <div className="text-sm font-bold text-[#1D2B29]">Satu vena umbilikalis</div>
                  <div className="mt-1 text-sm leading-relaxed text-[#33443F]">Membawa nutrisi dan oksigen dari ibu ke janin.</div>
                </li>
                <li className="rounded-[18px] bg-white p-4 ring-1 ring-[#D9E7E2]">
                  <div className="text-sm font-bold text-[#1D2B29]">Dua arteri umbilikalis</div>
                  <div className="mt-1 text-sm leading-relaxed text-[#33443F]">Membawa sisa metabolisme janin menuju sirkulasi ibu.</div>
                </li>
              </ul>

              <SectionHeading className="mt-7">Posisi insersi</SectionHeading>
              <div className="mt-1 text-sm leading-relaxed text-[#536961]">Contoh posisi tempat tali pusat menempel pada plasenta.</div>
              <img
                src="/s-06/s-06c/insersi-tali-pusat.webp"
                alt="Diagram lima posisi insersi tali pusat pada plasenta"
                className="mt-3 aspect-video w-full rounded-[20px] bg-[#FFFDEC] object-contain"
              />
              <ol className="mt-3 space-y-2">
                {insersi.map((item, index) => (
                  <li key={item.title} className="flex items-start gap-3 rounded-[16px] bg-white px-3.5 py-3 ring-1 ring-[#D9E7E2]">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#EAF4F0] text-xs font-bold text-[#4A6E54]">{index + 1}</span>
                    <div>
                      <div className="text-sm font-bold text-[#1D2B29]">{item.title}</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-[#536961]">{item.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <InfoNote title="Pemantauan">
                Posisi insersi dan aliran tali pusat dibahas bersama tenaga kesehatan berdasarkan hasil pemeriksaan.
              </InfoNote>
            </>
          )}

          {tab === "plasenta" && (
            <>
              <div className="text-sm leading-relaxed text-[#33443F]">Plasenta membantu pertukaran oksigen, nutrisi, dan zat sisa antara ibu dan janin.</div>
              <img
                src="/s-06/s-06c/permukaan-plasenta.webp"
                alt="Perbandingan permukaan fetal dan maternal pada plasenta"
                className="mt-4 aspect-[4/3] w-full rounded-[20px] bg-[#FFFDEC] object-contain"
              />
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-[#EAF4F0] p-1">
                {(["janin", "ibu"] as const).map((item) => {
                  const active = surface === item
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSurface(item)}
                      className={`min-h-11 rounded-full px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54] ${active ? "bg-[#4A6E54] text-white" : "text-[#33443F] hover:bg-white/70"}`}
                    >
                      Sisi {item === "janin" ? "janin" : "ibu"}
                    </button>
                  )
                })}
              </div>
              <div aria-live="polite" className="mt-3 rounded-[18px] bg-white p-4 ring-1 ring-[#D9E7E2]">
                <div className="text-sm font-bold text-[#1D2B29]">Permukaan {surface === "janin" ? "fetal" : "maternal"}</div>
                <div className="mt-1 text-sm leading-relaxed text-[#33443F]">
                  {surface === "janin"
                    ? "Menghadap janin, tampak halus dan keputihan karena tertutup amnion. Pembuluh darah terlihat di bawah amnion."
                    : "Menghadap dinding rahim, berwarna merah dan terbagi menjadi beberapa bagian."}
                </div>
              </div>

              <SectionHeading className="mt-7">Fungsi plasenta</SectionHeading>
              <ul className="mt-3 divide-y divide-[#D9E7E2] rounded-[20px] bg-white px-4 ring-1 ring-[#D9E7E2]">
                {fungsiPlasenta.map((item) => (
                  <li key={item.title} className="py-3.5">
                    <div className="text-sm font-bold text-[#1D2B29]">{item.title}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-[#536961]">{item.description}</div>
                  </li>
                ))}
              </ul>
              <InfoNote title="Pemantauan USG">
                Kecukupan air ketuban, aliran darah tali pusat, dan posisi plasenta dipantau melalui pemeriksaan USG. Konsultasikan hasilnya kepada bidan atau dokter.
              </InfoNote>
              <div className="mt-3 rounded-[16px] bg-[#EAF4F0] px-4 py-3 text-xs leading-relaxed text-[#33443F]">
                Pada akhir kehamilan, plasenta umumnya berbentuk cakram. Ukuran dan kondisinya dinilai tenaga kesehatan melalui pemeriksaan.
              </div>
            </>
          )}

          <details className="mt-7 rounded-[18px] bg-white px-4 py-3 ring-1 ring-[#D9E7E2]">
            <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold text-[#33443F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">Sumber materi</summary>
            <div className="pb-2 text-xs leading-relaxed text-[#536961]">Materi ini disusun dari ekstraksi prototype SiKiBa dan dokumen materi edukasi. Angka, istilah, dan tanda yang memerlukan tindakan perlu ditinjau tenaga kesehatan sebelum dipublikasikan.</div>
          </details>
        </section>

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

function SectionHeading({ className = "", children }: { className?: string; children: string }) {
  return <h2 className={`text-lg font-bold text-[#1D2B29] ${className}`}>{children}</h2>
}

function InfoNote({ children, title }: { children: string; title: string }) {
  return (
    <aside className="mt-5 rounded-[18px] bg-[#FFF1E8] p-4">
      <div className="flex items-center gap-2 text-[#7A4310]">
        <CircleHelp className="size-4 shrink-0" aria-hidden="true" />
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-[#5E452E]">{children}</div>
    </aside>
  )
}
