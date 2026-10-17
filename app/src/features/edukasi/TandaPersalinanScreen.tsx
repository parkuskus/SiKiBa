import { AlertTriangle, ChevronDown } from "lucide-react"
import EdukasiDetailHeader from "./EdukasiDetailHeader"

const tanda = [
  { judul: "Kontraksi Rahim yang Teratur", gambar: "/s-06/s-06h/kontraksi.webp", alt: "Ilustrasi kontraksi rahim", isi: "Perut terasa kencang atau mulas yang datang berulang, semakin teratur, lebih kuat, dan lebih sering. Kontraksi palsu umumnya tidak teratur dan dapat mereda ketika ibu beristirahat atau mengubah posisi. Namun, perubahan kontraksi perlu dinilai berdasarkan kondisi masing-masing ibu." },
  { judul: "Keluar Lendir Bercampur Darah", gambar: "/s-06/s-06h/lendir-campur-darah.webp", alt: "Ilustrasi lendir bercampur darah", isi: "Lendir dapat berwarna bening, merah muda, atau kecokelatan. Kondisi ini dapat terjadi ketika leher rahim mulai mengalami perubahan menjelang persalinan. Keluarnya lendir bercampur sedikit darah tidak selalu berarti persalinan akan langsung terjadi." },
  { judul: "Air Ketuban Keluar", gambar: "/s-06/s-06h/ketuban-keluar.webp", alt: "Ilustrasi air ketuban keluar", isi: "Air ketuban dapat merembes sedikit demi sedikit atau keluar sekaligus. Jika Bunda menduga air ketuban telah keluar, segera hubungi bidan atau datang ke fasilitas kesehatan, meskipun kontraksi belum terasa." },
]

const persiapan = [
  "Buku KIA dan dokumen pemeriksaan",
  "Tas persalinan serta perlengkapan ibu dan bayi",
  "Kendaraan dan pendamping persalinan",
  "Biaya persalinan serta kontak fasilitas kesehatan",
  "Rencana tempat persalinan dan calon pendonor darah jika diperlukan",
]

export default function TandaPersalinanScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="-mx-4 -mt-5">
      <EdukasiDetailHeader nomor={8} label="Persalinan" judul="Kenali Tanda-Tanda Persalinan" deskripsi="Kenali perubahan yang menandakan persalinan mungkin akan segera dimulai agar Bunda dapat mempersiapkan diri dan mengetahui kapan harus mencari pertolongan." teksBagikan="Baca materi Tanda-Tanda Persalinan di SIAGA Bunda." onBack={onBack} />
      <main className="relative mx-4 rounded-t-[32px] bg-[#FFFCF6] px-5 pb-36 pt-5">
        <img src="/s-06/s-06h/hero-persiapan.webp" alt="Ibu hamil trimester ketiga bersama tas persalinan" className="block h-auto w-full rounded-[20px] bg-[#FFFDEC]" />

        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-[#1D2B29]">Apa Itu Tanda-Tanda Persalinan?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#33443F]">Tanda-tanda persalinan merupakan perubahan yang menunjukkan bahwa proses persalinan mungkin akan segera dimulai. Tanda yang dialami setiap ibu dapat berbeda, sehingga penting untuk mengenali perubahan yang terjadi dan mengikuti arahan tenaga kesehatan.</p>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-extrabold text-[#1D2B29]">Tanda-Tanda Persalinan</h2>
          <ol className="mt-3 space-y-3">
            {tanda.map((item, index) => (
              <li key={item.judul} className="overflow-hidden rounded-[20px] bg-white ring-1 ring-[#D9E7E2]">
                <img src={item.gambar} alt={item.alt} className="block h-auto w-full bg-transparent object-contain" />
                <div className="flex items-start gap-3 p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#4A6E54] text-sm font-bold text-white">{index + 1}</span>
                  <div><h3 className="text-sm font-bold text-[#1D2B29]">{item.judul}</h3><p className="mt-1.5 text-sm leading-relaxed text-[#33443F]">{item.isi}</p></div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-7 rounded-[20px] bg-[#FFE2E2] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#8E2424]" aria-hidden="true" />
            <div>
              <h2 className="text-base font-extrabold text-[#1D2B29]">Kapan Harus Segera ke Fasilitas Kesehatan?</h2>
              <ol className="mt-2 list-decimal space-y-2 text-sm leading-relaxed text-[#33443F]">
                {["Air ketuban keluar atau dicurigai merembes.", "Perdarahan dari jalan lahir, terutama jika darah banyak.", "Gerakan janin berkurang dari biasanya.", "Kontraksi semakin kuat dan teratur sesuai arahan bidan atau dokter.", "Sakit kepala hebat, pandangan kabur, kejang, atau nyeri perut hebat."].map((item) => <li key={item}>{item}</li>)}
              </ol>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-[#8E2424]">Jangan menunggu semua tanda muncul. Jika air ketuban keluar, terjadi perdarahan, gerakan janin berkurang, atau muncul tanda bahaya, segera cari pertolongan di fasilitas kesehatan.</p>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-extrabold text-[#1D2B29]">Apa yang Perlu Dipersiapkan?</h2>
          <ol className="mt-3 list-decimal divide-y divide-[#D9E7E2] rounded-[20px] bg-white px-4 pl-9 ring-1 ring-[#D9E7E2]">
            {persiapan.map((item) => <li key={item} className="py-3.5 pr-2 text-sm leading-relaxed text-[#33443F]">{item}</li>)}
          </ol>
          <p className="mt-5 text-sm leading-relaxed text-[#33443F]">Persiapan yang baik membantu Bunda lebih siap menghadapi persalinan. Diskusikan rencana persalinan dengan bidan atau dokter selama pemeriksaan kehamilan.</p>
        </section>

        <section className="mt-7">
          <details className="group rounded-[18px] bg-white ring-1 ring-[#D9E7E2]">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[#1D2B29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4A6E54] [&::-webkit-details-marker]:hidden">
              <span>Sumber Referensi</span>
              <ChevronDown className="size-4 shrink-0 text-[#4A6E54] transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul className="space-y-2 border-t border-[#D9E7E2] px-4 py-3 text-xs leading-relaxed text-[#33443F]">
              <li>Kementerian Kesehatan RI, Buku Kesehatan Ibu dan Anak (KIA), Edisi 2024.</li>
              <li>Buku Saku Pelayanan Kesehatan Ibu di Fasilitas Kesehatan Dasar dan Rujukan.</li>
            </ul>
          </details>
        </section>
        <button type="button" onClick={onBack} className="mt-6 min-h-11 w-full rounded-full bg-[#4A6E54] px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D2B29]">Kembali ke Edukasi</button>
      </main>
    </div>
  )
}
