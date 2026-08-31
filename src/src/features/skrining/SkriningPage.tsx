import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import RiskFactorScreen from "@/features/skrining/ibu-hamil/RiskFactorScreen"

type SkriningTab = "hamil" | "nifas" | "bbl"
type RiskResult = { skor: number; kategori: string; warna: string; faktorRisiko: string[] }

export default function SkriningPage({
  setTab,
  setShowBirth,
}: {
  setTab: (t: "beranda" | "skrining" | "edukasi" | "tracker" | "profil") => void
  setShowBirth: (v: boolean) => void
}) {
  const [skriningTab, setSkriningTab] = useState<SkriningTab>("hamil")
  const [showRiskForm, setShowRiskForm] = useState(false)
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-[Poppins] text-[18px] font-semibold text-[#1E2326] leading-tight">Skrining Kesehatan</h2>
        <p className="mt-1 text-sm leading-relaxed text-[#8A8F93]">Jawab pertanyaan singkat. Hasil ditampilkan dengan warna agar mudah dipahami.</p>
      </div>

      <div className="rounded-[24px] bg-[#F0F5F1] p-3 ring-1 ring-[#EAE6E0] flex gap-3 items-center">
        <div className="w-20 shrink-0">
          <img src="/illu/illu-02-clipboard.png" alt="Papan cek" className="h-[72px] w-full object-contain rounded-[16px] bg-white ring-1 ring-[#EAE6E0] p-1.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1E2326] leading-tight">Progress Skrining</p>
          <p className="text-xs text-[#8A8F93]">6 cek, 3 sampai 5 menit per cek</p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-white overflow-hidden ring-1 ring-black/5">
            <div className="h-full rounded-full bg-[#7AAE9A]" style={{ width: "50%" }} />
          </div>
          <p className="text-[11px] text-[#8A8F93] mt-1">3 dari 6 sudah selesai</p>
        </div>
      </div>

      <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-[#EAE6E0] shadow-sm">
        {(["hamil", "nifas", "bbl"] as SkriningTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setSkriningTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium min-h-8 transition-colors ${skriningTab === t ? "bg-[#7AAE9A] text-white" : "text-[#8A8F93]"}`}
          >
            {t === "hamil" ? "Hamil" : t === "nifas" ? "Nifas" : "Bayi"}
          </button>
        ))}
      </div>

      {showRiskForm ? (
        <RiskFactorScreen
          onBack={() => setShowRiskForm(false)}
          onSuccess={(r) => {
            setRiskResult(r)
            setShowRiskForm(false)
          }}
        />
      ) : (
        <>
          {riskResult && (
            <Card className={`rounded-[24px] border-0 ring-1 overflow-hidden shadow-sm ${riskResult.warna === "HIJAU" ? "bg-[#EDF6EF] ring-[#7ACB8A]/20" : riskResult.warna === "KUNING" ? "bg-[#FFF8EC] ring-[#F5C16C]/20" : "bg-[#FDECEC] ring-[#E57373]/20"}`}>
              <CardContent className="p-4 text-center">
                <p className="text-[11px] font-bold tracking-[0.08em] text-[#6C757D]">HASIL SKRINING</p>
                <p className={`mt-1 font-[Poppins] text-lg font-semibold ${riskResult.warna === "HIJAU" ? "text-[#2E7D32]" : riskResult.warna === "KUNING" ? "text-[#8A6D00]" : "text-[#C62828]"}`}>
                  {riskResult.warna === "HIJAU" ? "Risiko rendah" : riskResult.warna === "KUNING" ? "Risiko sedang" : "Risiko tinggi"}
                </p>
                <p className="text-sm text-[#1E2326]">Skor {riskResult.skor} {riskResult.kategori}</p>
                {riskResult.faktorRisiko.length > 0 && <p className="mt-2 text-xs text-[#6C757D]">Faktor {riskResult.faktorRisiko.join(", ")}</p>}
                <p className="mt-2 text-xs leading-relaxed text-[#6C757D]">
                  {riskResult.warna === "HIJAU" ? "Lanjutkan kontrol rutin di fasilitas kesehatan." : riskResult.warna === "KUNING" ? "Perlu perhatian lebih, kontrol lebih sering sesuai anjuran bidan." : "Segera konsultasi ke fasilitas kesehatan untuk tindak lanjut."}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full bg-white" onClick={() => setRiskResult(null)}>Tutup</Button>
                  <Button size="sm" className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" onClick={() => setShowRiskForm(true)}>Ulangi</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-[#F7F2EB]">
                {skriningTab === "hamil" &&
                  [
                    { title: "Skrining Faktor Risiko Kehamilan", sub: "Skrining untuk menilai risiko dari riwayat hamil", done: !!riskResult, warna: riskResult?.warna },
                    { title: "Skrining Status Gizi", sub: "Skrining untuk memantau gizi Bunda dan janin", done: false },
                    { title: "Skrining Tanda Bahaya Kehamilan", sub: "Skrining untuk mengenali tanda yang perlu segera diperiksa", done: false },
                    { title: "Skrining Preeklamsia", sub: "Skrining untuk deteksi dini tekanan darah tinggi", done: false },
                    { title: "Skrining Diabetes Gestasional", sub: "Skrining untuk cek risiko gula darah saat hamil", done: false },
                    { title: "Suasana Kesehatan Mental", sub: "Skrining untuk memantau suasana hati Bunda", done: false },
                  ].map((it) => (
                    <button
                      key={it.title}
                      onClick={() => {
                        if (it.title.includes("Faktor Risiko")) setShowRiskForm(true)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#FFFCF6] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1E2326] leading-tight">{it.title}</p>
                        <p className="text-xs text-[#8A8F93] truncate">{it.sub}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 shrink-0 ${it.done ? (it.warna === "MERAH" ? "bg-[#FDECEC] text-[#C62828] ring-[#E57373]/20" : it.warna === "KUNING" ? "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/20" : "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20") : "bg-[#F7F2EB] text-[#8A8F93] ring-[#EAE6E0]"}`}>
                        {it.done ? (it.warna === "MERAH" ? "Perlu rujuk" : it.warna === "KUNING" ? "Waspada" : "Selesai") : "Belum"}
                      </span>
                      <ChevronRight className="size-4 text-[#C2C8CB] shrink-0" />
                    </button>
                  ))}

                {skriningTab !== "hamil" && (
                  <div className="p-6 flex flex-col items-center text-center">
                    {skriningTab === "nifas" ? (
                      <img src="/illu/illu-06-nifas.png" alt="Ibu dan bayi pada masa nifas" className="h-32 w-auto object-contain" />
                    ) : (
                      <img src="/illu/illu-07-bayi.png" alt="Bayi baru lahir" className="h-32 w-auto object-contain" />
                    )}
                    <p className="mt-6 text-sm font-semibold text-[#1E2326] text-center max-w-[22ch]">{skriningTab === "nifas" ? "Cek nifas akan terbuka setelah melahirkan" : "Cek bayi akan terbuka setelah melahirkan"}</p>
                    <p className="text-xs text-[#8A8F93] mt-2 max-w-[30ch] mx-auto leading-relaxed text-center">Ketuk Sudah melahirkan di Beranda untuk membuka cek nifas dan bayi.</p>
                    <Button size="sm" className="mt-4 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white shadow-sm px-6" onClick={() => { setTab("beranda"); setTimeout(() => setShowBirth(true), 200) }}>
                      Buka cek
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-[#8A8F93]">Semua skrining dapat diulang kapan saja. Warna hijau aman, kuning perlu perhatian, merah segera ke fasilitas kesehatan.</p>
        </>
      )}
    </div>
  )
}
