import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { submitMental } from "@/features/skrining/ibu-hamil/mentalForm"

const QUESTIONS = [
  "Saya dapat tertawa dan melihat sisi menyenangkan",
  "Saya menatap masa depan dengan gembira",
  "Saya menyalahkan diri sendiri tanpa alasan",
  "Saya cemas tanpa alasan yang jelas",
  "Saya takut atau panik tanpa alasan",
  "Saya merasa kewalahan",
  "Saya sulit tidur karena tidak bahagia",
  "Saya merasa sedih dan murung",
  "Saya menangis karena tidak bahagia",
  "Pikiran untuk menyakiti diri sendiri muncul",
]

export default function MentalScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(1))
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try {
      const res = await submitMental({ userId: "demo-siti", answers })
      onSuccess(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="size-8 rounded-full bg-[#FFFCF6] ring-1 ring-[#EAE6E0] grid place-items-center text-[#7AAE9A]">
            <ChevronRight className="size-4 rotate-180" />
          </button>
          <div>
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Kesehatan Mental</p>
            <p className="text-xs text-[#8A8F93]">Skrining untuk memantau suasana hati Bunda</p>
          </div>
        </div>

        <div className="space-y-3">
          {QUESTIONS.map((q, idx) => (
            <div key={idx} className="rounded-2xl bg-[#FFFCF6] p-3 ring-1 ring-[#EAE6E0]">
              <p className="text-sm text-[#1E2326] leading-tight">
                {idx + 1}. {q}
              </p>
              <div className="mt-2 flex gap-1.5">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAnswers((a) => { const n = [...a]; n[idx] = v; return n })}
                    className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${answers[idx] === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {idx === 9 && <p className="mt-1 text-[11px] text-[#E57373]">Jika skor 1 atau lebih, segera konsultasi</p>}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={onBack}>Batal</Button>
          <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" disabled={loading} onClick={handle}>
            {loading ? "Menyimpan" : "Lihat hasil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
