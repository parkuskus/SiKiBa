import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DiaryEntry } from "@/data/db"

// S-07c: riwayat diary — judul jadi judul card
export default function DiaryHistory({ entries, onBack }: { entries: DiaryEntry[]; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <button onClick={onBack} aria-label="Kembali" className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-[#EAE6E0] text-[#6C757D] active:scale-[0.98] transition">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">Riwayat Diary</h1>
          <p className="text-xs text-[#8A8F93]">{entries.length} entri tersimpan</p>
        </div>
      </div>

      {entries.length ? (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id} className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${e.mood <= 2 ? "bg-[#E57373]" : e.mood === 3 ? "bg-[#F5C16C]" : "bg-[#7AAE9A]"}`}>{e.mood}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold tracking-tight text-[#1E2326]">{e.judul || "Tanpa judul"}</p>
                    <p className="text-[11px] text-[#8A8F93]">{new Date(`${e.tanggal}T00:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#2E3436]">{e.teks}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="p-6 text-center text-sm text-[#8A8F93]">Belum ada diary. Tulis yang pertama di menu Reminder.</p>
      )}
    </div>
  )
}
