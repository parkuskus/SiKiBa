import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import RiskFactorScreen from "@/features/skrining/ibu-hamil/RiskFactorScreen"
import GiziScreen from "@/features/skrining/ibu-hamil/GiziScreen"
import DangerSignScreen from "@/features/skrining/ibu-hamil/DangerSignScreen"
import PreeklamsiaScreen from "@/features/skrining/ibu-hamil/PreeklamsiaScreen"
import DmgScreen from "@/features/skrining/ibu-hamil/DmgScreen"
import MentalScreen from "@/features/skrining/ibu-hamil/MentalScreen"
import NifasScreen from "@/features/skrining/nifas/NifasScreen"
import LaktasiScreen from "@/features/skrining/nifas/LaktasiScreen"
import IkterusScreen from "@/features/skrining/bbl/IkterusScreen"
import HipotiroidScreen from "@/features/skrining/bbl/HipotiroidScreen"

type SkriningTab = "hamil" | "nifas" | "bbl"
type ActiveForm = null | "risk" | "gizi" | "danger" | "preeklamsia" | "dmg" | "mental" | "nifas" | "laktasi" | "ikterus" | "hipotiroid"
type AnyResult = { warna: string; kategori?: string; skor?: number; extra?: string }

export default function SkriningPage({
  setTab,
  setShowBirth,
  isPostpartum = false,
}: {
  setTab: (t: "beranda" | "skrining" | "edukasi" | "tracker" | "profil") => void
  setShowBirth: (v: boolean) => void
  isPostpartum?: boolean
}) {
  const [skriningTab, setSkriningTab] = useState<SkriningTab>("hamil")
  const [activeForm, setActiveForm] = useState<ActiveForm>(null)
  const [results, setResults] = useState<Record<string, AnyResult>>({})

  const doneCount = Object.keys(results).length
  const progressPct = Math.round((doneCount / 6) * 100)

  const handleSuccess = (key: string, r: AnyResult) => {
    setResults((prev) => ({ ...prev, [key]: r }))
    setActiveForm(null)
  }

  if (activeForm === "risk") {
    return (
      <div className="space-y-4">
        <RiskFactorScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("risk", { warna: r.warna, kategori: r.kategori, skor: r.skor, extra: r.faktorRisiko.join(", ") })}
        />
      </div>
    )
  }
  if (activeForm === "gizi") {
    return (
      <div className="space-y-4">
        <GiziScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("gizi", { warna: (r as { warna: string }).warna, kategori: (r as { imtKat: string }).imtKat, extra: `${(r as { kenaikanAktual: number }).kenaikanAktual} kg, ${(r as { trajectory: string }).trajectory}` })} />
      </div>
    )
  }
  if (activeForm === "danger") {
    return (
      <div className="space-y-4">
        <DangerSignScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("danger", { warna: (r as { kategori: string }).kategori })} />
      </div>
    )
  }
  if (activeForm === "preeklamsia") {
    return (
      <div className="space-y-4">
        <PreeklamsiaScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("preeklamsia", { warna: (r as { kategori: string }).kategori, extra: `MAP ${(r as { map: number }).map}` })} />
      </div>
    )
  }
  if (activeForm === "dmg") {
    return (
      <div className="space-y-4">
        <DmgScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("dmg", { warna: (r as { kategori: string }).kategori, extra: (r as { perluTTGO: boolean }).perluTTGO ? "Perlu TTGO" : "Tidak perlu TTGO" })} />
      </div>
    )
  }
  if (activeForm === "mental") {
    return (
      <div className="space-y-4">
        <MentalScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("mental", { warna: (r as { kategori: string }).kategori, skor: (r as { total: number }).total })} />
      </div>
    )
  }
  if (activeForm === "nifas") {
    return (
      <div className="space-y-4">
        <NifasScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("nifas", { warna: r.warna, kategori: r.kategori, extra: r.warna })}
        />
      </div>
    )
  }
  if (activeForm === "laktasi") {
    return (
      <div className="space-y-4">
        <LaktasiScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("laktasi", { warna: r.warna, kategori: r.kategori, extra: r.warna })}
        />
      </div>
    )
  }
  if (activeForm === "ikterus") {
    return (
      <div className="space-y-4">
        <IkterusScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("ikterus", { warna: r.warna, kategori: r.kategori, extra: r.warna })}
        />
      </div>
    )
  }
  if (activeForm === "hipotiroid") {
    return (
      <div className="space-y-4">
        <HipotiroidScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("hipotiroid", { warna: r.warna, kategori: r.kategori, extra: r.warna })}
        />
      </div>
    )
  }

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
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-white overflow-hidden ring-1 ring-black/5">
            <div className="h-full rounded-full bg-[#7AAE9A] transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[11px] text-[#8A8F93] mt-1">{doneCount} dari 6 sudah selesai</p>
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

      {Object.keys(results).length > 0 && (
        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs font-bold tracking-wide text-[#7AAE9A]">RINGKASAN</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(results).map(([k, r]) => (
                <span key={k} className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${r.warna === "MERAH" ? "bg-[#FDECEC] text-[#C62828] ring-[#E57373]/20" : r.warna === "KUNING" ? "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/20" : "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20"}`}>
                  {k}: {r.warna}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-[#F7F2EB]">
            {skriningTab === "hamil" &&
              [
                { key: "risk", title: "Skrining Faktor Risiko Kehamilan", sub: "Skrining untuk menilai risiko dari riwayat hamil" },
                { key: "gizi", title: "Skrining Status Gizi", sub: "Skrining untuk memantau gizi Bunda dan janin" },
                { key: "danger", title: "Skrining Tanda Bahaya Kehamilan", sub: "Skrining untuk mengenali tanda yang perlu segera diperiksa" },
                { key: "preeklamsia", title: "Skrining Preeklamsia", sub: "Skrining untuk deteksi dini tekanan darah tinggi" },
                { key: "dmg", title: "Skrining Diabetes Gestasional", sub: "Skrining untuk cek risiko gula darah saat hamil" },
                { key: "mental", title: "Suasana Kesehatan Mental", sub: "Skrining untuk memantau suasana hati Bunda" },
              ].map((it) => {
                const r = results[it.key]
                const done = !!r
                return (
                  <button
                    key={it.key}
                    onClick={() => setActiveForm(it.key as ActiveForm)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#FFFCF6] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1E2326] leading-tight">{it.title}</p>
                      <p className="text-xs text-[#8A8F93] truncate">{it.sub} {r?.extra ? ` ${r.extra}` : ""}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 shrink-0 ${done ? (r.warna === "MERAH" ? "bg-[#FDECEC] text-[#C62828] ring-[#E57373]/20" : r.warna === "KUNING" ? "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/20" : "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20") : "bg-[#F7F2EB] text-[#8A8F93] ring-[#EAE6E0]"}`}>
                      {done ? (r.warna === "MERAH" ? "Perlu rujuk" : r.warna === "KUNING" ? "Waspada" : "Selesai") : "Belum"}
                    </span>
                    <ChevronRight className="size-4 text-[#C2C8CB] shrink-0" />
                  </button>
                )
              })}

            {skriningTab === "nifas" &&
              (isPostpartum ? (
                [
                  { key: "nifas", title: "Skrining Masa Nifas", sub: "Cek harian 0 sampai 42 hari setelah lahiran" },
                  { key: "laktasi", title: "Skrining Laktasi dan Menyusui", sub: "Cek kecukupan ASI dan masalah menyusui" },
                ].map((it) => {
                  const r = results[it.key]
                  const done = !!r
                  return (
                    <button
                      key={it.key}
                      onClick={() => setActiveForm(it.key as ActiveForm)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#FFFCF6] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1E2326] leading-tight">{it.title}</p>
                        <p className="text-xs text-[#8A8F93] truncate">{it.sub} {r?.extra ? ` ${r.extra}` : ""}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 shrink-0 ${done ? (r.warna === "MERAH" ? "bg-[#FDECEC] text-[#C62828] ring-[#E57373]/20" : r.warna === "KUNING" ? "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/20" : "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20") : "bg-[#F7F2EB] text-[#8A8F93] ring-[#EAE6E0]"}`}>
                        {done ? (r.warna === "MERAH" ? "Perlu rujuk" : r.warna === "KUNING" ? "Waspada" : "Selesai") : "Belum"}
                      </span>
                      <ChevronRight className="size-4 text-[#C2C8CB] shrink-0" />
                    </button>
                  )
                })
              ) : (
                <div className="p-6 flex flex-col items-center text-center">
                  <img src="/illu/illu-06-nifas.png" alt="Ibu dan bayi pada masa nifas" className="h-32 w-auto object-contain" />
                  <p className="mt-6 text-sm font-semibold text-[#1E2326] text-center max-w-[22ch]">Cek nifas akan terbuka setelah melahirkan</p>
                  <p className="text-xs text-[#8A8F93] mt-2 max-w-[30ch] mx-auto leading-relaxed text-center">Ketuk Sudah melahirkan di Beranda untuk membuka cek nifas dan bayi.</p>
                  <Button size="sm" className="mt-4 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white shadow-sm px-6" onClick={() => { setTab("beranda"); setTimeout(() => setShowBirth(true), 200) }}>
                    Buka cek
                  </Button>
                </div>
              ))}

            {skriningTab === "bbl" &&
              (isPostpartum ? (
                [
                  { key: "ikterus", title: "Skrining Ikterus Neonatal", sub: "Cek kuning pada bayi dengan zona Kramer" },
                  { key: "hipotiroid", title: "Skrining Hipotiroid Kongenital", sub: "Cek TSH dan gejala hipotiroid pada bayi" },
                ].map((it) => {
                  const r = results[it.key]
                  const done = !!r
                  return (
                    <button
                      key={it.key}
                      onClick={() => setActiveForm(it.key as ActiveForm)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#FFFCF6] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1E2326] leading-tight">{it.title}</p>
                        <p className="text-xs text-[#8A8F93] truncate">{it.sub} {r?.extra ? ` ${r.extra}` : ""}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 shrink-0 ${done ? (r.warna === "MERAH" ? "bg-[#FDECEC] text-[#C62828] ring-[#E57373]/20" : r.warna === "KUNING" ? "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/20" : "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20") : "bg-[#F7F2EB] text-[#8A8F93] ring-[#EAE6E0]"}`}>
                        {done ? (r.warna === "MERAH" ? "Perlu rujuk" : r.warna === "KUNING" ? "Waspada" : "Selesai") : "Belum"}
                      </span>
                      <ChevronRight className="size-4 text-[#C2C8CB] shrink-0" />
                    </button>
                  )
                })
              ) : (
                <div className="p-6 flex flex-col items-center text-center">
                  <img src="/illu/illu-07-bayi.png" alt="Bayi baru lahir" className="h-32 w-auto object-contain" />
                  <p className="mt-6 text-sm font-semibold text-[#1E2326] text-center max-w-[22ch]">Cek bayi akan terbuka setelah melahirkan</p>
                  <p className="text-xs text-[#8A8F93] mt-2 max-w-[30ch] mx-auto leading-relaxed text-center">Ketuk Sudah melahirkan di Beranda untuk membuka cek nifas dan bayi.</p>
                  <Button size="sm" className="mt-4 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white shadow-sm px-6" onClick={() => { setTab("beranda"); setTimeout(() => setShowBirth(true), 200) }}>
                    Buka cek
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-[#8A8F93]">Semua skrining dapat diulang kapan saja. Warna hijau aman, kuning perlu perhatian, merah segera ke fasilitas kesehatan.</p>
    </div>
  )
}
