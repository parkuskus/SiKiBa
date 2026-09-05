import { useEffect, useState } from "react"
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
import SkriningResultScreen from "@/features/skrining/components/SkriningResultScreen"
import { getCurrentUserId } from "@/data/currentUser"
import { shareViaWA } from "@/services/exportService"

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
  const [results, setResults] = useState<Record<string, AnyResult & { createdAt?: string }>>({})
  const [activeResult, setActiveResult] = useState<null | {
    tipeKey: string
    tipeLabel: string
    warna: "HIJAU" | "KUNING" | "MERAH"
    kategori: string
    skor?: number | string
    skorLabel?: string
    faktorRisiko: string[]
    faktorAman: string[]
    rekomendasi: string[]
    urgensiLabel: string
    waktuISO: string
  }>(null)

  const isToday = (iso?: string) => {
    if (!iso) return true
    try {
      const a = new Date(iso).toLocaleDateString("en-CA")
      const b = new Date().toLocaleDateString("en-CA")
      return a === b
    } catch { return true }
  }

  // ponytail: testing mode — ikuti isPostpartum saja, tanpa cek 42 hari
  const isNifasActive = isPostpartum

  const HAMIL_KEYS = ["risk", "gizi", "danger", "preeklamsia", "dmg", "mental"] as const
  const NIFAS_BBL_KEYS = ["nifas", "laktasi", "ikterus", "hipotiroid"] as const

  const relevantKeys = isNifasActive ? (NIFAS_BBL_KEYS as unknown as string[]) : (HAMIL_KEYS as unknown as string[])
  const doneCount = relevantKeys.filter((k) => results[k] && isToday((results[k] as { createdAt?: string }).createdAt)).length
  const totalForMode = relevantKeys.length
  const progressPct = totalForMode ? Math.round((doneCount / totalForMode) * 100) : 0

  useEffect(() => {
    if (isNifasActive && skriningTab === "hamil") setSkriningTab("nifas")
  }, [isNifasActive, skriningTab])

  useEffect(() => {
    void (async () => {
      try {
        const { db } = await import("@/data/db")
        const { getCurrentUserId } = await import("@/data/currentUser")
        const uid = await getCurrentUserId()
        const all = await db.screeningResults.where("userId").equals(uid).toArray()
        const today = all.filter((r) => isToday(r.createdAt))
        const map: Record<string, AnyResult & { createdAt?: string }> = {}
        const tipeToKey: Record<string, string> = {
          poedji_rochjati: "risk",
          imt_lila: "gizi",
          danger_sign: "danger",
          preeklamsia: "preeklamsia",
          dmg: "dmg",
          epds: "mental",
          nifas: "nifas",
          laktasi: "laktasi",
          ikterus: "ikterus",
          hipotiroid: "hipotiroid",
        }
        for (const r of today) {
          const k = tipeToKey[r.tipe] ?? r.tipe
          map[k] = { warna: r.kategori, kategori: r.kategori, skor: r.skor, extra: String(r.skor), createdAt: r.createdAt }
        }
        if (Object.keys(map).length) setResults((prev) => ({ ...map, ...prev }))
      } catch {}
    })()
  }, [])

  const rekomFor = (warna: "HIJAU" | "KUNING" | "MERAH", tipeLabel: string): string[] => {
    const base: Record<string, string[]> = {
      HIJAU: [
        `Lanjutkan kontrol rutin sesuai jadwal ANC di ${tipeLabel.toLowerCase().includes("gizi") ? "posyandu" : "puskesmas"}`,
        "Pantau kondisi harian dan catat keluhan jika muncul",
        "Jaga gizi seimbang, istirahat cukup, dan minum suplemen sesuai anjuran",
      ],
      KUNING: [
        "Hubungi bidan pendamping dalam 24 jam untuk evaluasi lanjutan",
        "Pantau tanda bahaya setiap hari dan catat di buku KIA",
        "Datang ke puskesmas sesuai saran bidan, bawa hasil skrining ini",
      ],
      MERAH: [
        "Segera ke IGD atau puskesmas PONED terdekat, jangan tunda",
        "Hubungi bidan pendamping sekarang dan informasikan hasil skrining",
        "Bawa KTP, buku KIA, dan hasil skrining ini saat rujukan",
      ],
    }
    return base[warna]
  }

  const urgensiFor = (warna: "HIJAU" | "KUNING" | "MERAH") => (warna === "HIJAU" ? "Pantau mandiri" : warna === "KUNING" ? "Kunjungi bidan" : "Segera ke IGD")

  const handleSuccess = (key: string, r: AnyResult, meta?: { tipeLabel: string; faktorRisiko?: string[]; faktorAman?: string[]; skor?: number | string; kategori?: string; skorLabel?: string; rekomendasiTambahan?: string[] }) => {
    const withDate = { ...r, createdAt: new Date().toISOString() } as AnyResult & { createdAt: string }
    setResults((prev) => ({ ...prev, [key]: withDate }))
    setActiveForm(null)
    if (meta) {
      const warna = r.warna as "HIJAU" | "KUNING" | "MERAH"
      setActiveResult({
        tipeKey: key,
        tipeLabel: meta.tipeLabel,
        warna,
        kategori: meta.kategori ?? r.kategori ?? warna,
        skor: meta.skor ?? r.skor,
        skorLabel: meta.skorLabel,
        faktorRisiko: meta.faktorRisiko ?? (r.extra ? [r.extra] : []),
        faktorAman: meta.faktorAman ?? (warna === "HIJAU" ? ["Tidak ada tanda bahaya terdeteksi", "Kondisi umum baik"] : []),
        rekomendasi: [...(meta.rekomendasiTambahan ?? []), ...rekomFor(warna, meta.tipeLabel)],
        urgensiLabel: urgensiFor(warna),
        waktuISO: new Date().toISOString(),
      })
    }
  }

  const handleBagikan = async () => {
    try {
      const uid = await getCurrentUserId()
      await shareViaWA(uid)
    } catch {}
  }



  if (activeForm === "risk") {
    return (
      <div className="space-y-4">
        <RiskFactorScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("risk", { warna: r.warna, kategori: r.kategori, skor: r.skor, extra: r.faktorRisiko.join(", ") }, { tipeLabel: "Faktor Risiko Kehamilan", kategori: r.kategori, skor: r.skor, skorLabel: `Skor ${r.skor} · ${r.kategori}`, faktorRisiko: r.faktorRisiko, faktorAman: (r as { faktorAman?: string[] }).faktorAman ?? [] })}
        />
      </div>
    )
  }
  if (activeForm === "gizi") {
    return (
      <div className="space-y-4">
        <GiziScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("gizi", { warna: (r as { warna: string }).warna, kategori: (r as { imtKat: string }).imtKat, extra: `${(r as { kenaikanAktual: number }).kenaikanAktual} kg, ${(r as { trajectory: string }).trajectory}` }, { tipeLabel: "Status Gizi", kategori: (r as { imtKat: string }).imtKat, skor: (r as { imt: number }).imt?.toFixed(1), skorLabel: `IMT ${(r as { imt: number }).imt?.toFixed(1)} · ${(r as { imtKat: string }).imtKat}`, faktorRisiko: (r as { warna: string }).warna === "HIJAU" ? [] : [`${(r as { imtKat: string }).imtKat}${(r as { lilaKat: string }).lilaKat === "KEK" ? " + KEK" : ""} · kenaikan ${(r as { trajectory: string }).trajectory}`], faktorAman: (r as { warna: string }).warna === "HIJAU" ? ["IMT dan LILA normal", `Kenaikan BB ${(r as { trajectory: string }).trajectory}`] : [] })} />
      </div>
    )
  }
  if (activeForm === "danger") {
    return (
      <div className="space-y-4">
        <DangerSignScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("danger", { warna: (r as { kategori: string }).kategori }, { tipeLabel: "Tanda Bahaya Kehamilan", kategori: (r as { kategori: string }).kategori, faktorRisiko: (r as { flags: string[] }).flags ?? [], faktorAman: (r as { kategori: string }).kategori === "HIJAU" ? ["Tidak ada tanda bahaya terdeteksi"] : [] })} />
      </div>
    )
  }
  if (activeForm === "preeklamsia") {
    return (
      <div className="space-y-4">
        <PreeklamsiaScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("preeklamsia", { warna: (r as { kategori: string }).kategori, extra: `MAP ${(r as { map: number }).map}` }, { tipeLabel: "Preeklamsia", kategori: (r as { kategori: string }).kategori, skor: (r as { map: number }).map, skorLabel: `MAP ${(r as { map: number }).map}`, faktorRisiko: (r as { faktorRisiko?: string[] }).faktorRisiko ?? [], faktorAman: (r as { faktorAman?: string[] }).faktorAman ?? [], rekomendasiTambahan: (r as { perluAspirin?: boolean }).perluAspirin ? ["Konsultasikan aspirin dosis rendah 75–150 mg ke dokter atau bidan (anjuran tenaga kesehatan bila usia kehamilan di bawah 16 minggu)"] : [] })} />
      </div>
    )
  }
  if (activeForm === "dmg") {
    return (
      <div className="space-y-4">
        <DmgScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("dmg", { warna: (r as { kategori: string }).kategori, extra: (r as { perluTTGO: boolean }).perluTTGO ? "Perlu TTGO" : "Tidak perlu TTGO" }, { tipeLabel: "Diabetes Gestasional", kategori: (r as { kategori: string }).kategori, faktorRisiko: (r as { kategori: string }).kategori === "MERAH" ? ["Risiko tinggi DMG — perlu TTGO 24–28 minggu"] : (r as { kategori: string }).kategori === "KUNING" ? ["Risiko sedang — pantau gula darah"] : [], faktorAman: (r as { kategori: string }).kategori === "HIJAU" ? ["Tidak ada faktor risiko DMG"] : [] })} />
      </div>
    )
  }
  if (activeForm === "mental") {
    return (
      <div className="space-y-4">
        <MentalScreen onBack={() => setActiveForm(null)} onSuccess={(r: any) => handleSuccess("mental", { warna: (r as { kategori: string }).kategori, skor: (r as { total: number }).total }, { tipeLabel: "Kesehatan Mental (EPDS)", kategori: (r as { kategori: string }).kategori, skor: (r as { total: number }).total, skorLabel: `EPDS ${(r as { total: number }).total}`, faktorRisiko: (r as { kategori: string }).kategori !== "HIJAU" ? [`Skor EPDS ${(r as { total: number }).total} — ${(r as { kategori: string }).kategori}`] : [], faktorAman: (r as { kategori: string }).kategori === "HIJAU" ? ["Suasana hati dalam batas normal"] : [] })} />
      </div>
    )
  }
  if (activeForm === "nifas") {
    return (
      <div className="space-y-4">
        <NifasScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("nifas", { warna: r.warna, kategori: r.kategori, extra: r.warna }, { tipeLabel: "Masa Nifas (MEOWS)", kategori: r.kategori, faktorRisiko: r.warna !== "HIJAU" ? [`Parameter nifas menunjukkan ${r.kategori}`] : [], faktorAman: r.warna === "HIJAU" ? ["Tanda vital nifas normal"] : [] })}
        />
      </div>
    )
  }
  if (activeForm === "laktasi") {
    return (
      <div className="space-y-4">
        <LaktasiScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("laktasi", { warna: r.warna, kategori: r.kategori, extra: r.warna }, { tipeLabel: "Laktasi & Menyusui", kategori: r.kategori, faktorRisiko: r.warna !== "HIJAU" ? [r.kategori] : [], faktorAman: r.warna === "HIJAU" ? ["Menyusui berjalan baik"] : [] })}
        />
      </div>
    )
  }
  if (activeForm === "ikterus") {
    return (
      <div className="space-y-4">
        <IkterusScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("ikterus", { warna: r.warna, kategori: r.kategori, extra: r.warna }, { tipeLabel: "Ikterus Neonatal (Kramer)", kategori: r.kategori, faktorRisiko: r.warna !== "HIJAU" ? [`Ikterus — ${r.kategori}`] : [], faktorAman: r.warna === "HIJAU" ? ["Ikterus fisiologis — pantau"] : [] })}
        />
      </div>
    )
  }
  if (activeForm === "hipotiroid") {
    return (
      <div className="space-y-4">
        <HipotiroidScreen
          onBack={() => setActiveForm(null)}
          onSuccess={(r) => handleSuccess("hipotiroid", { warna: r.warna, kategori: r.kategori, extra: r.warna }, { tipeLabel: "Hipotiroid Kongenital", kategori: r.kategori, faktorRisiko: r.kategori === "HIJAU" ? [] : ["Gejala hipotiroid atau TSH belum diperiksa"], faktorAman: r.kategori === "HIJAU" ? ["TSH dalam window 48–72 jam atau tanpa gejala"] : [] })}
        />
      </div>
    )
  }

  if (activeResult) {
    return (
      <SkriningResultScreen
        tipeLabel={activeResult.tipeLabel}
        warna={activeResult.warna}
        kategori={activeResult.kategori}
        skor={activeResult.skor}
        skorLabel={activeResult.skorLabel}
        faktorRisiko={activeResult.faktorRisiko}
        faktorAman={activeResult.faktorAman}
        rekomendasi={activeResult.rekomendasi}
        urgensiLabel={activeResult.urgensiLabel}
        waktuISO={activeResult.waktuISO}
        onBack={() => setActiveResult(null)}
        onUlangi={() => {
          const k = activeResult.tipeKey as ActiveForm
          setActiveResult(null)
          setActiveForm(k)
        }}
        onBeranda={() => {
          setActiveResult(null)
          setTab("beranda")
        }}
        onBagikan={handleBagikan}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-semibold text-[#1E2326] leading-tight">Skrining Kesehatan</h2>
        <p className="mt-1 text-sm leading-relaxed text-[#8A8F93]">Jawab pertanyaan singkat. Hasil ditampilkan dengan warna agar mudah dipahami.</p>
      </div>

      <div className="rounded-[24px] bg-[#F0F5F1] p-3 ring-1 ring-[#EAE6E0] flex gap-3 items-center">
        <div className="w-20 shrink-0">
          <img src="/illu/illu-02-clipboard.png" alt="Papan cek" className="h-[72px] w-full object-contain rounded-[16px] bg-white ring-1 ring-[#EAE6E0] p-1.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1E2326] leading-tight">Progress Skrining {isNifasActive ? "Nifas & Bayi" : "Hamil"}</p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-white overflow-hidden ring-1 ring-black/5">
            <div className="h-full rounded-full bg-[#7AAE9A] transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[11px] font-medium text-[#2E3436] mt-1">{doneCount} dari {totalForMode} skrining sudah selesai</p>
          <p className="text-[10px] text-[#8A8F93]">Keterangan: progress skrining direset setiap hari</p>
        </div>
      </div>

      <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-[#EAE6E0] shadow-sm">
        {(["hamil", "nifas", "bbl"] as SkriningTab[]).map((t) => {
          const lockedHamil = isNifasActive && t === "hamil"
          return (
            <button
              key={t}
              disabled={lockedHamil}
              onClick={() => !lockedHamil && setSkriningTab(t)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium min-h-8 transition-colors ${skriningTab === t ? "bg-[#7AAE9A] text-white" : "text-[#8A8F93]"} ${lockedHamil ? "opacity-40 cursor-not-allowed" : ""}`}
              title={lockedHamil ? "Terkunci selama masa nifas (42 hari)" : undefined}
            >
              {t === "hamil" ? "Hamil" : t === "nifas" ? "Nifas" : "Bayi"} {lockedHamil ? "🔒" : ""}
            </button>
          )
        })}
      </div>

      {(() => {
        const keyToLabel: Record<string, string> = {
          risk: "Skrining Risiko",
          gizi: "Skrining Gizi",
          danger: "Skrining Tanda Bahaya",
          preeklamsia: "Skrining Preeklamsia",
          dmg: "Skrining DMG",
          mental: "Skrining Mental",
          nifas: "Skrining Nifas",
          laktasi: "Skrining Laktasi",
          ikterus: "Skrining Ikterus",
          hipotiroid: "Skrining Hipotiroid",
        }
        // (2) ringkasan harian & mode-aware: filter hanya hari ini + kunci relevan mode
        const ringkasanEntries = (relevantKeys as string[])
          .map((k) => ({ k, r: results[k] }))
          .filter(({ r }) => r && isToday((r as { createdAt?: string }).createdAt))
        if (!ringkasanEntries.length) return null
        return (
          <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
            <CardContent className="p-3">
              <p className="text-xs font-bold tracking-wide text-[#7AAE9A]">RINGKASAN HARI INI</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ringkasanEntries.map(({ k, r }) => (
                  <span
                    key={k}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${r!.warna === "MERAH" ? "bg-[#FDECEC] text-[#C62828] ring-[#E57373]/20" : r!.warna === "KUNING" ? "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/20" : "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20"}`}
                  >
                    {keyToLabel[k] ?? k}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })()}

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-[#F7F2EB]">
            {skriningTab === "hamil" && !isNifasActive && (
              <>
                {[
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
                      <p className="text-xs text-[#8A8F93] truncate">{it.sub}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 shrink-0 ${done ? (r.warna === "MERAH" ? "bg-[#FDECEC] text-[#C62828] ring-[#E57373]/20" : r.warna === "KUNING" ? "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/20" : "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20") : "bg-[#F7F2EB] text-[#8A8F93] ring-[#EAE6E0]"}`}>
                      {done ? (r.warna === "MERAH" ? "Perlu rujuk" : r.warna === "KUNING" ? "Waspada" : "Selesai") : "Belum"}
                    </span>
                    <ChevronRight className="size-4 text-[#C2C8CB] shrink-0" />
                  </button>
                )
                })}
              </>
            )}
            {skriningTab === "hamil" && isNifasActive && (
              <div className="p-6 flex flex-col items-center text-center">
                <p className="text-sm font-semibold text-[#1E2326]">Skrining hamil terkunci</p>
                <p className="text-xs text-[#8A8F93] mt-2 max-w-[28ch] leading-relaxed">Mode nifas aktif. Ubah ke hamil dari tombol Kembali di Beranda untuk testing.</p>
              </div>
            )}
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
                        <p className="text-xs text-[#8A8F93] truncate">{it.sub}</p>
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
                        <p className="text-xs text-[#8A8F93] truncate">{it.sub}</p>
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
