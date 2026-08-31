import { ChevronRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Props = { uk: number; hplLabel: string }

export default function ProfilPage({ uk, hplLabel }: Props) {
  return (
    <div className="space-y-4">
      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4 flex gap-3 items-center">
          <div className="size-12 rounded-2xl bg-[#EAF2EC] ring-1 ring-[#7AAE9A]/15 grid place-items-center text-[#7AAE9A] font-semibold">S</div>
          <div className="min-w-0 flex-1">
            <p className="font-[Poppins] text-sm font-semibold text-[#1E2326] leading-none">Siti 26 tahun</p>
            <p className="text-xs text-[#8A8F93]">Hamil minggu ke {uk}, perkiraan lahir {hplLabel}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-xs">
            Ubah
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-[#1E2326]">Riwayat cek</p>
          <div className="mt-2.5 rounded-2xl ring-1 ring-[#EAE6E0] overflow-hidden divide-y divide-[#F7F2EB]">
            {[
              { t: "28 Agustus aman", c: "hijau" },
              { t: "27 Agustus aman", c: "hijau" },
              { t: "15 Agustus perlu perhatian", c: "kuning" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-white">
                <span className={`size-2 rounded-full ${r.c === "hijau" ? "bg-[#7ACB8A]" : "bg-[#F5C16C]"}`} />
                <span className="text-sm text-[#1E2326] flex-1">{r.t}</span>
                <ChevronRight className="size-4 text-[#C2C8CB]" />
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-3 rounded-full gap-1.5 text-sm" size="sm">
            Lihat semua riwayat <ChevronRight className="size-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4 flex gap-3 items-center">
          <div className="size-10 rounded-xl bg-[#F7F2EB] grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
            <Heart className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Butuh bantuan</p>
            <p className="text-xs text-[#8A8F93]">Hubungi bidan pendamping</p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full">
            Chat
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-[11px] leading-relaxed text-[#9AA3A6] px-6">Data tersimpan aman di ponsel. Dapat dibuka tanpa internet.</p>
    </div>
  )
}
