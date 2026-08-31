import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function EdukasiPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-[Poppins] text-[18px] font-semibold text-[#1E2326]">Belajar</h2>
        <p className="text-sm text-[#8A8F93]">Penjelasan singkat tanpa istilah sulit.</p>
      </div>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] overflow-hidden shadow-sm">
        <div className="p-3">
          <img src="/illu/illu-03-janin.png" alt="Ilustrasi janin minggu ke 28" className="h-36 w-full object-contain rounded-[16px] bg-[#F7F2EB] ring-1 ring-[#EAE6E0] p-2" />
        </div>
        <CardContent className="px-4 pb-4 pt-0 flex flex-col justify-center">
          <span className="inline-flex w-fit rounded-full bg-[#EAF2EC] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#5A8A7A] ring-1 ring-[#7AAE9A]/15">Untuk minggu ini 28</span>
          <h3 className="mt-2 font-[Poppins] text-[15px] font-semibold text-[#1E2326] leading-tight">Si Kecil sebesar terong</h3>
          <p className="text-sm text-[#6C757D] leading-relaxed">Sekitar 1,2 kilogram, panjang 37 sentimeter. Kelopak mata sudah dapat membuka.</p>
          <Button size="sm" className="mt-3 w-fit rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] gap-1.5">
            Baca <ArrowRight className="size-3.5" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            t: "Awal kehamilan",
            d: "Bagaimana terjadi",
            img: "https://images.unsplash.com/photo-1710897778422-aa4748478b62?w=400&h=300&fit=crop&auto=format&q=60",
            alt: "Ibu hamil memegang perut",
          },
          {
            t: "Tanda bahaya",
            d: "Kapan harus periksa",
            img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop&auto=format&q=60",
            alt: "Konsultasi dokter",
          },
          {
            t: "Gizi sehari hari",
            d: "Makan dan vitamin",
            img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format&q=60",
            alt: "Makanan sehat sayur",
          },
          {
            t: "Persiapan lahiran",
            d: "Tas, donor, dan transport",
            img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=400&h=300&fit=crop&auto=format&q=60",
            alt: "Tas persiapan lahiran",
          },
        ].map((it) => (
          <Card key={it.t} className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] overflow-hidden shadow-sm">
            <div className="p-2">
              <img src={it.img} alt={it.alt} loading="lazy" className="h-20 w-full rounded-[16px] object-cover ring-1 ring-[#EAE6E0]" />
            </div>
            <CardContent className="px-3 pb-3 pt-0">
              <p className="text-sm font-semibold text-[#1E2326] leading-tight">{it.t}</p>
              <p className="text-xs text-[#8A8F93]">{it.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
