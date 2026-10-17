import { BookHeart, ChevronDown, HeartHandshake, ShieldCheck } from "lucide-react"
import EdukasiDetailHeader from "./EdukasiDetailHeader"

const langkah = [
  ["Bayi dikeringkan dan dinilai kondisinya", "Setelah lahir, tenaga kesehatan melakukan penilaian kondisi bayi dan perawatan awal yang diperlukan."],
  ["Bayi diletakkan di dada ibu", "Jika kondisi ibu dan bayi stabil, bayi diletakkan di dada ibu tanpa penghalang pakaian agar terjadi kontak kulit ke kulit. Bayi dijaga tetap hangat dan jalan napasnya tetap terlihat."],
  ["Kontak kulit ke kulit dilanjutkan", "Ibu dan bayi dibiarkan bersama tanpa gangguan yang tidak diperlukan, dengan pemantauan tenaga kesehatan."],
  ["Bayi mulai mencari dan menyusu pada payudara", "Tenaga kesehatan membantu bila diperlukan. IMD bukan berarti bayi harus langsung dipaksa melekat atau mengisap payudara."],
] as const

export default function ImdScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="-mx-4 -mt-5">
      <EdukasiDetailHeader nomor={7} label="IMD" judul="Inisiasi Menyusu Dini" deskripsi="Ketahui pengertian, manfaat, dan cara pelaksanaan IMD agar Bunda dapat mendukung proses menyusui sejak awal kehidupan." teksBagikan="Baca materi Inisiasi Menyusu Dini di SIAGA Bunda." onBack={onBack} />
      <main className="relative mx-4 rounded-t-[32px] bg-[#FFFCF6] px-5 pb-36 pt-5">
        <img src="/s-06/s-06g/imd-hero.webp" alt="Ibu melakukan kontak kulit ke kulit dengan bayi baru lahir" className="block h-auto w-full rounded-[20px] bg-[#FFFDEC]" />
        <h2 className="mt-5 text-xl font-extrabold leading-tight text-[#1D2B29]">IMD Langkah Awal Menyusu yang Penting bagi Ibu dan Bayi</h2>

        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-[#1D2B29]">Apa Itu IMD?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#33443F]">Inisiasi Menyusu Dini (IMD) adalah proses memberikan kesempatan kepada bayi baru lahir untuk mulai menyusu sesegera mungkin setelah persalinan, idealnya dalam satu jam pertama setelah lahir. Pelaksanaannya melibatkan kontak kulit ke kulit antara ibu dan bayi.</p>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-extrabold text-[#1D2B29]">Manfaat IMD</h2>
          <div className="mt-3 space-y-3">
            <article className="flex gap-3 rounded-[20px] bg-white p-3.5 ring-1 ring-[#D9E7E2]">
              <img src="/s-06/s-06g/manfaat-bayi.webp" alt="Ilustrasi bayi baru lahir" className="size-[76px] shrink-0 rounded-[16px] bg-[#FFFDEC] object-cover" />
              <div><h3 className="text-sm font-bold text-[#1D2B29]">Bagi bayi</h3><p className="mt-1 text-sm leading-relaxed text-[#33443F]">Membantu menjaga suhu tubuh, mendukung proses menyusu, dan memberi kesempatan memperoleh kolostrum yang kaya zat gizi serta komponen perlindungan tubuh.</p></div>
            </article>
            <article className="flex gap-3 rounded-[20px] bg-white p-3.5 ring-1 ring-[#D9E7E2]">
              <img src="/s-06/s-06g/manfaat-ibu.webp" alt="Ibu yang memulai proses menyusui" className="size-[76px] shrink-0 rounded-[16px] bg-[#FFFDEC] object-cover" />
              <div><h3 className="text-sm font-bold text-[#1D2B29]">Bagi ibu</h3><p className="mt-1 text-sm leading-relaxed text-[#33443F]">Membantu memulai proses menyusui dan merangsang hormon yang berperan dalam produksi ASI.</p></div>
            </article>
            <article className="flex items-start gap-3 rounded-[20px] bg-[#EAF4F0] p-4">
              <HeartHandshake className="mt-0.5 size-5 shrink-0 text-[#4A6E54]" aria-hidden="true" />
              <div><h3 className="text-sm font-bold text-[#1D2B29]">Bagi ibu dan bayi</h3><p className="mt-1 text-sm leading-relaxed text-[#33443F]">Membantu membangun kedekatan sejak awal kehidupan.</p></div>
            </article>
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-extrabold text-[#1D2B29]">Bagaimana IMD Dilakukan?</h2>
          <ol className="mt-3 space-y-2.5">
            {langkah.map(([judul, isi], index) => (
              <li key={judul} className="flex gap-3 rounded-[20px] bg-white p-3.5 ring-1 ring-[#D9E7E2]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#4A6E54] text-sm font-bold text-white">{index + 1}</span>
                <div><h3 className="text-sm font-bold text-[#1D2B29]">{judul}</h3><p className="mt-1 text-sm leading-relaxed text-[#33443F]">{isi}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="mt-4 rounded-[20px] bg-[#EAF4F0] p-4 text-sm leading-relaxed text-[#33443F]">
          <p>Kontak kulit ke kulit dianjurkan berlangsung segera dan tanpa terputus, idealnya setidaknya selama satu jam, dengan tetap memperhatikan keselamatan ibu dan bayi.</p>
        </aside>

        <section className="mt-7 rounded-[20px] bg-[#FFE2E2] p-4">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#8E2424]" aria-hidden="true" /><div><h2 className="text-base font-extrabold text-[#1D2B29]">Kapan IMD Perlu Disesuaikan?</h2><p className="mt-2 text-sm leading-relaxed text-[#33443F]">IMD diupayakan pada ibu dan bayi yang kondisinya memungkinkan. Jika ibu atau bayi membutuhkan penanganan medis, keselamatan dan stabilisasi harus diprioritaskan. IMD dan menyusui dapat dimulai sesegera mungkin setelah kondisi memungkinkan, dengan bantuan tenaga kesehatan.</p></div></div>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-extrabold text-[#1D2B29]">Apa yang Perlu Dipersiapkan?</h2>
          <ul className="mt-3 divide-y divide-[#D9E7E2] rounded-[20px] bg-white px-4 ring-1 ring-[#D9E7E2]">
            {["Diskusikan rencana IMD dengan bidan atau dokter selama pemeriksaan kehamilan.", "Sampaikan keinginan melakukan kontak kulit ke kulit dan menyusui dini saat persalinan.", "Minta pendamping membantu menyampaikan rencana jika diperlukan.", "Ikuti arahan tenaga kesehatan sesuai kondisi ibu dan bayi."].map((item) => <li key={item} className="flex gap-3 py-3.5 text-sm leading-relaxed text-[#33443F]"><BookHeart className="mt-0.5 size-4 shrink-0 text-[#4A6E54]" aria-hidden="true" />{item}</li>)}
          </ul>
        </section>

        <section className="mt-7">
          <details className="group rounded-[18px] bg-white ring-1 ring-[#D9E7E2]">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[#1D2B29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4A6E54] [&::-webkit-details-marker]:hidden">
              <span>Sumber Referensi</span>
              <ChevronDown className="size-4 shrink-0 text-[#4A6E54] transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul className="space-y-2 border-t border-[#D9E7E2] px-4 py-3 text-xs leading-relaxed text-[#33443F]">
              <li>Kementerian Kesehatan RI, Buku Kesehatan Ibu dan Anak (Buku KIA).</li>
              <li>WHO, rekomendasi mengenai kontak kulit ke kulit dini dan inisiasi menyusu.</li>
            </ul>
          </details>
        </section>

        <button type="button" onClick={onBack} className="mt-6 min-h-11 w-full rounded-full bg-[#4A6E54] px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D2B29]">Kembali ke Edukasi</button>
      </main>
    </div>
  )
}
