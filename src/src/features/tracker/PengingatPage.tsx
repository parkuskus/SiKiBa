import { useState } from "react"
import { Check, Bell, CalendarDays, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function PengingatPage() {
  const [suplemen, setSuplemen] = useState({ fe: true, folat: true, ca: false })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-[Poppins] text-[18px] font-semibold text-[#1E2326]">Pengingat</h2>
        <p className="text-sm text-[#8A8F93]">Pengingat suplemen dan jadwal periksa</p>
      </div>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-[#1E2326]">Pengingat suplemen harian</p>
          <p className="text-xs text-[#8A8F93]">Atur jam minum vitamin</p>
          <div className="mt-3 space-y-2">
            {[
              { id: "fe", nama: "Zat besi", jam: "19.00" },
              { id: "folat", nama: "Asam folat", jam: "07.30" },
              { id: "ca", nama: "Kalsium", jam: "12.00" },
            ].map((it) => {
              const checked = suplemen[it.id as keyof typeof suplemen]
              return (
                <div key={it.id} className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0]">
                  <div>
                    <p className="text-sm font-medium text-[#1E2326] leading-none">{it.nama} jam {it.jam}</p>
                    <p className="text-xs text-[#8A8F93]">Setiap hari</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuplemen((s) => ({ ...s, [it.id]: !s[it.id as keyof typeof s] }))}
                    aria-pressed={checked}
                    className={`size-6 shrink-0 rounded-full grid place-items-center ring-1 transition-colors ${checked ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-transparent ring-[#EAE6E0]"}`}
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <div className="size-8 rounded-xl bg-[#EAF2EC] grid place-items-center text-[#7AAE9A] ring-1 ring-[#7AAE9A]/15">
                <Scale className="size-4" />
              </div>
              <p className="text-sm font-semibold text-[#1E2326] pt-1.5">Berat badan</p>
              <span className="ml-auto mt-1 rounded-full bg-[#EDF6EF] px-2 py-1 text-xs font-semibold text-[#2E7D32] ring-1 ring-[#7ACB8A]/15">Naik stabil</span>
            </div>
            <div className="mt-6 flex items-end gap-1 h-[72px]">
              {[58.2, 58.9, 59.4, 60.1, 60.8, 61.3, 61.9, 62.4].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-t-lg bg-[#7AAE9A]" style={{ height: `${(v - 57) * 11}px` }} />
                  <span className="text-[10px] text-[#9AA3A6]">M {i + 21}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-center text-[#8A8F93]">62,4 kilogram minggu ini</p>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-[#1E2326] flex items-center gap-2">
              <CalendarDays className="size-4 text-[#7AAE9A]" /> Jadwal periksa
            </p>
            <p className="text-xs text-[#8A8F93]">Selanjutnya 3 hari lagi</p>
            <div className="mt-3 space-y-2">
              {[
                { n: "Periksa 1 dan 2", t: "Sudah selesai", done: true },
                { n: "Periksa 3 pada 24 Mei", t: "Berikutnya", next: true },
                { n: "Sisa 3 periksa lagi", t: "Juni sampai Oktober", done: false },
              ].map((a) => (
                <div key={a.n} className="flex items-center gap-3 rounded-2xl bg-[#FFFCF6] px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                  <span className={`size-7 rounded-full grid place-items-center shrink-0 ${a.done ? "bg-[#EDF6EF] text-[#3D8B5E] ring-1 ring-[#7ACB8A]/20" : a.next ? "bg-[#FFF4E0] text-[#8A5A00] ring-1 ring-[#F5C16C]/20" : "bg-white text-[#8A8F93] ring-1 ring-[#EAE6E0]"}`}>
                    {a.done ? <Check className="size-4" /> : a.next ? <Bell className="size-3.5" /> : <CalendarDays className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1E2326] leading-none">{a.n}</p>
                    <p className="text-xs text-[#8A8F93]">{a.t}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
