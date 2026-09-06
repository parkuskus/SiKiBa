import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { submitMental } from "@/features/skrining/ibu-hamil/mentalForm"

// Tabel 1 S-03f (Cox et al. 1987, final Diva) — urutan opsi = skor 0-3
const QUESTIONS: { q: string; options: [string, string, string, string] }[] = [
  { q: "Saya dapat tertawa dan melihat sisi yang menyenangkan dari suatu hal", options: ["Sebanyak-banyaknya", "Sekarang ini tidak terlalu banyak", "Sedikit", "Tidak sama sekali"] },
  { q: "Saya gembira menghadapi segala sesuatu", options: ["Sebanyak-banyaknya", "Berkurang sedikit dari biasanya", "Sangat kurang dari biasanya", "Hampir tidak pernah"] },
  { q: "Saya menyalahkan diri sendiri secara tidak semestinya bila keadaan menjadi buruk", options: ["Tidak, tidak pernah", "Tidak terlalu sering", "Ya, kadang-kadang", "Ya, hampir selalu"] },
  { q: "Saya merasa khawatir atau cemas tanpa alasan yang jelas", options: ["Tidak, tidak sama sekali", "Hampir tidak pernah", "Ya, kadang-kadang", "Ya, sangat sering"] },
  { q: "Saya merasa takut atau panik tanpa alasan yang jelas", options: ["Tidak sama sekali", "Tidak, tidak banyak", "Ya, kadang-kadang", "Ya, cukup sering"] },
  { q: "Segala sesuatu terasa membebani saya", options: ["Tidak, saya bisa mengatasinya dengan baik seperti biasa", "Tidak, hampir selalu saya bisa mengatasinya dengan baik", "Ya, kadang-kadang saya tidak bisa mengatasinya sebaik biasanya", "Ya, hampir selalu saya tidak bisa mengatasinya"] },
  { q: "Saya merasa tidak bahagia hingga saya merasa sulit untuk tidur", options: ["Tidak sama sekali", "Tidak terlalu sering", "Ya, kadang-kadang", "Ya, hampir setiap waktu"] },
  { q: "Saya merasa sedih dan jengkel tidak menentu", options: ["Tidak sama sekali", "Tidak, tidak banyak", "Ya, kadang-kadang", "Ya, hampir setiap waktu"] },
  { q: "Saya merasa sangat tidak bahagia hingga menangis", options: ["Tidak sama sekali", "Tidak begitu sering", "Ya, cukup sering", "Ya, hampir setiap waktu"] },
  { q: "Pikiran untuk melukai diri sendiri telah terjadi pada saya", options: ["Tidak pernah", "Hanya sesekali", "Ya, cukup sering", "Ya, hampir setiap waktu"] },
]

export default function MentalScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const answered = answers.filter((a) => a !== null).length

  const handle = async () => {
    setError(null)
    if (answered < 10) return setError(`Masih ada ${10 - answered} pertanyaan belum dijawab`)
    setLoading(true)
    try {
      const res = await submitMental({ userId: await getCurrentUserId(), answers: answers as number[] })
      onSuccess(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <div className="mb-2">
        <h2 className="text-2xl font-bold tracking-tight text-[#1E2326]">Kesehatan Mental (EPDS)</h2>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#8A8F93]">Jawab sesuai yang Bunda rasakan dalam 7 hari terakhir</p>
        <p className="mt-1 text-xs leading-relaxed text-[#8A8F93]">{answered} dari 10 terjawab</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EAE6E0]">
          <div className="h-full rounded-full bg-[#1E2326] transition-all" style={{ width: `${answered * 10}%` }} />
        </div>
      </div>

      {QUESTIONS.map((item, idx) => (
        <Card key={idx} className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div>
              <p className="text-[11px] font-bold tracking-[0.08em] text-[#8A8F93]">PERTANYAAN {idx + 1}</p>
              <p className="mt-1 text-[15px] font-bold leading-snug tracking-tight text-[#1E2326]">{item.q}</p>
            </div>
            <div className="space-y-2">
              {item.options.map((opt, v) => {
                const selected = answers[idx] === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAnswers((a) => { const n = [...a]; n[idx] = v; return n })}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm ring-1 transition-colors active:scale-[0.99] ${selected ? "bg-[#7AAE9A] font-semibold text-white ring-[#7AAE9A]" : "bg-white text-[#1E2326] ring-[#EAE6E0] hover:bg-[#FFFCF6]"}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {idx === 9 && <p className="text-[11px] leading-relaxed text-[#C62828]">Bila pernah terlintas pikiran menyakiti diri, segera hubungi bidan atau layanan konseling.</p>}
          </CardContent>
        </Card>
      ))}

      {error && <p className="text-center text-xs text-[#E57373]">{error}</p>}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-full" onClick={onBack}>Batal</Button>
        <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" disabled={loading} onClick={handle}>
          {loading ? "Menyimpan" : "Lihat hasil"}
        </Button>
      </div>
    </div>
  )
}
