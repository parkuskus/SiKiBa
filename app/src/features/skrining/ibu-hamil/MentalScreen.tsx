import { useEffect, useState } from "react"
import { useLatestScreeningDraft } from "@/features/skrining/useLatestScreeningDraft"
import { Button } from "@/components/ui/button"
import { submitMental } from "@/features/skrining/ibu-hamil/mentalForm"
import SkriningFormShell from "@/features/skrining/components/SkriningFormShell"
import EmergencyOverlay from "@/shared/components/EmergencyOverlay"
import ScreeningValidationSheet, { ScreeningMarker } from "../components/ScreeningValidationSheet"
import { toScreeningIssues } from "../components/screeningValidationUI"

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
  const { loading: draftLoading, userId, detail } = useLatestScreeningDraft("epds")
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [validationOpen, setValidationOpen] = useState(false)

  useEffect(() => {
    if (!draftLoading && Array.isArray(detail?.answers) && detail.answers.length === 10) {
      setAnswers(detail.answers.map((answer) => typeof answer === "number" ? answer : null))
      if (typeof detail.answers[9] === "number" && detail.answers[9] >= 1) setEmergencyOpen(true)
    }
  }, [draftLoading, detail])

  const answered = answers.filter((a) => a !== null).length
  const errors = Object.fromEntries(answers.flatMap((answer, idx) => answer === null || !Number.isInteger(answer) || answer < 0 || answer > 3
    ? [[String(idx), "Pilih satu jawaban bernilai 0 sampai 3 sesuai yang Bunda rasakan"]] : []))
  const issues = toScreeningIssues(errors, Object.fromEntries(QUESTIONS.map((_, idx) => [String(idx), `Pertanyaan ${idx + 1}`])))

  const handle = async () => {
    setError(null)
    setAttempted(true)
    if (issues.length) { setValidationOpen(true); return }
    setLoading(true)
    try {
      const res = await submitMental({ userId, answers: answers as number[] })
      onSuccess(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SkriningFormShell title="Kesehatan Mental" subtitle="Kuesioner EPDS" onBack={onBack} illustration="/illu/illu-51-skrining-mental.webp" loading={draftLoading}>
      <div className="space-y-3.5">
        <section className="space-y-2 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Suasana hati Bunda</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#33443F]">Jawab sesuai yang Bunda rasakan dalam 7 hari terakhir</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-[#9D2553]">{answered}/10</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#FFE2E2]">
            <div className="h-full rounded-full bg-[#4A6E54] transition-all" style={{ width: `${answered * 10}%` }} />
          </div>
        </section>

        {QUESTIONS.map((item, idx) => (
          <section key={idx} data-screening-field={idx} className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-[#4A6E54] ring-1 ring-[#D9E7E2]">{idx + 1}</span>
              <p className="pt-1 text-[13px] font-bold leading-snug text-[#1D2B29]">{item.q}<ScreeningMarker error={attempted ? errors[idx] : undefined} /></p>
            </div>
            <div className="space-y-2">
              {item.options.map((option, value) => {
                const selected = answers[idx] === value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    aria-invalid={attempted && !!errors[idx]}
                    onClick={() => { setAnswers((current) => { const next = [...current]; next[idx] = value; return next }); if (idx === 9 && value >= 1) setEmergencyOpen(true) }}
                    className={`flex min-h-11 w-full items-center gap-2.5 rounded-[16px] px-3 text-left text-xs leading-snug transition-colors active:scale-[0.99] ${selected ? "bg-[#4A6E54] font-semibold text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2] hover:bg-[#FFFCF6]"}`}
                  >
                    <span className={`grid size-4 shrink-0 place-items-center rounded-full ring-1 ${selected ? "bg-white ring-white" : "bg-white ring-[#B8C9C1]"}`}>
                      {selected && <span className="size-2 rounded-full bg-[#4A6E54]" />}
                    </span>
                    {option}
                  </button>
                )
              })}
            </div>
            {idx === 9 && <p className="rounded-[14px] bg-[#FDECEC] p-2.5 text-xs leading-relaxed text-[#8E1F1F]">Bila pernah terlintas pikiran menyakiti diri, segera hubungi bidan atau layanan konseling.</p>}
          </section>
        ))}

        {error && <p role="alert" className="text-center text-xs text-[#C62828]">{error}</p>}
        <ScreeningValidationSheet issues={issues} open={validationOpen && !emergencyOpen} onOpenChange={setValidationOpen} onComplete={() => { setValidationOpen(false); requestAnimationFrame(() => { const field = document.querySelector<HTMLElement>(`[data-screening-field="${issues[0]?.key}"]`); field?.scrollIntoView({ behavior: "smooth", block: "center" }); field?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true }) }) }} />
        {answers[9] !== null && answers[9] >= 1 && <button type="button" className="min-h-11 w-full rounded-xl bg-[#FDECEC] p-3 text-sm font-bold text-[#8E1F1F]" onClick={() => setEmergencyOpen(true)}>Pikiran menyakiti diri dilaporkan. Cari bantuan sekarang meski kuesioner belum lengkap.</button>}
        {emergencyOpen && <div className="fixed inset-0 z-50"><EmergencyOverlay description="Pikiran menyakiti diri perlu bantuan segera. Hubungi orang terdekat, bidan, atau fasilitas kesehatan sekarang meski kuesioner belum lengkap; jangan menunggu koneksi internet." mapsQuery="Puskesmas atau IGD terdekat" onShare={() => { window.open(`https://wa.me/?text=${encodeURIComponent('Saya membutuhkan bantuan segera. Kuesioner kesehatan mental SIAGA Bunda belum lengkap.')}`, '_blank', 'noopener,noreferrer') }} onDismiss={() => setEmergencyOpen(false)} /></div>}
        <Button className="min-h-12 w-full rounded-full bg-[#4A6E54] text-base font-bold text-white hover:bg-[#3D5C46]" disabled={loading} onClick={handle}>
          {loading ? "Menyimpan" : "Lihat hasil"}
        </Button>
      </div>
    </SkriningFormShell>
  )
}
