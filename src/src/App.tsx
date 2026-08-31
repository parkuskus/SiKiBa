import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Activity,
  ArrowRight,
  Baby,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  Heart,
  Home,
  Scale,
  ShieldCheck,
  User,
  Bell,
  CalendarDays,
  Sparkles,
} from "lucide-react"

// PWA Illustrative Soft mobile only fokus HP 320 sampai 480px
// Palet warm paper #FFFCF6 dan sage lembut #7AAE9A
// Ilustrasi ada di extra/ILUSTRASI_PROMPT_SIAGA_BUNDA.md

type Tab = "beranda" | "skrining" | "edukasi" | "tracker" | "profil"
type SkriningTab = "hamil" | "nifas" | "bbl"

export default function App() {
  const [tab, setTab] = useState<Tab>("beranda")
  const [isPostpartum, setIsPostpartum] = useState(false)
  const [showBirth, setShowBirth] = useState(false)
  const [skriningTab, setSkriningTab] = useState<SkriningTab>("hamil")
  const [suplemen, setSuplemen] = useState({ fe: true, folat: true, ca: false })

  const uk = 28
  const progress = 70
  const countdown = 82
  const hplLabel = "19 Nov 2026"

  return (
    <div className="min-h-[100dvh] bg-[#FFFCF6] text-[#2E3436]">
      <header className="sticky top-0 z-20 border-b border-[#EAE6E0] bg-white/90 backdrop-blur-[10px]">
        <div className="mx-auto flex h-[56px] max-w-[480px] items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logo-siaga-bunda.png" alt="SIAGA Bunda" className="size-8 rounded-xl bg-white p-1 ring-1 ring-black/5 object-contain" />
            <div className="min-w-0">
              <p className="font-[Poppins] text-[14px] font-semibold leading-none tracking-tight text-[#1E2326]">SIAGA Bunda</p>
              <p className="text-[11px] leading-none text-[#8A8F93] hidden sm:block">Siaga menjaga Bunda</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="size-9 rounded-full bg-[#FFFCF6] ring-1 ring-[#EAE6E0] grid place-items-center text-[#7AAE9A]" aria-label="Notifikasi">
              <Bell className="size-4" />
            </button>
            <div className="size-8 rounded-full bg-[#EAF2EC] ring-1 ring-[#7AAE9A]/15 grid place-items-center text-sm font-semibold text-[#5A8A7A]">S</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-4 pb-28 pt-5">
        <div className="w-full">
          {tab === "beranda" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#8A8F93]">Senin, 31 Agustus 2026</p>
                <h1 className="font-[Poppins] text-[22px] font-semibold leading-tight text-[#1E2326]">Halo, Siti</h1>
              </div>

              <Card className="rounded-[24px] border-0 bg-[#F0F5F1] ring-1 ring-[#EAE6E0] overflow-hidden">
                <CardContent className="p-4">
                  {!isPostpartum ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-white grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
                          <CalendarDays className="size-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold tracking-[0.08em] text-[#7AAE9A]">PERJALANAN KEHAMILAN</p>
                          <p className="font-[Poppins] text-[15px] font-semibold text-[#1E2326] leading-tight">Trimester {uk < 14 ? 1 : uk < 28 ? 2 : 3}, {uk} minggu</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white overflow-hidden ring-1 ring-black/5">
                        <div className="h-full rounded-full bg-[#7AAE9A]" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-[#6C757D]">
                        <span>{uk} dari 40 minggu, {progress} persen</span>
                        <span>{countdown} hari menuju perkiraan lahir</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                          <p className="text-[11px] font-medium text-[#8A8F93]">GPA</p>
                          <p className="text-sm font-semibold text-[#1E2326]">G2P1A0</p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                          <p className="text-[11px] font-medium text-[#8A8F93]">Perkiraan Lahir</p>
                          <p className="text-sm font-semibold text-[#1E2326]">19 Nov 2026</p>
                        </div>
                      </div>
                      <button onClick={() => setShowBirth(true)} className="mt-3 w-full text-center text-sm font-medium text-[#7AAE9A] underline decoration-[#7AAE9A]/25 underline-offset-4">
                        Sudah melahirkan Ketuk di sini
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-white grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
                          <Baby className="size-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold tracking-[0.08em] text-[#7AAE9A]">MASA NIFAS</p>
                          <p className="font-[Poppins] text-[15px] font-semibold text-[#1E2326] leading-tight">Hari ke 2, 40 hari lagi</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white overflow-hidden ring-1 ring-black/5">
                        <div className="h-full rounded-full bg-[#7AAE9A]" style={{ width: "5%" }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-[#6C757D]">
                        <span>2 dari 42 hari</span>
                        <span>40 hari lagi</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                          <p className="text-[11px] font-medium text-[#8A8F93]">GPA</p>
                          <p className="text-sm font-semibold text-[#1E2326]">G2P1A0</p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                          <p className="text-[11px] font-medium text-[#8A8F93]">Bayi</p>
                          <p className="text-sm font-semibold text-[#1E2326]">3,2 kg, 49 cm</p>
                        </div>
                      </div>
                      <p className="mt-3 text-center text-xs leading-relaxed text-[#6C757D]">Bayi lahir 30 Agustus, laki laki. Cek nifas dan bayi ada di menu Skrining.</p>
                      <button onClick={() => setIsPostpartum(false)} className="mt-2 w-full text-center text-xs font-semibold text-[#7AAE9A]">Kembali ke mode hamil</button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-[0_10px_24px_-16px_rgba(34,28,22,0.10)] overflow-hidden">
                <CardContent className="p-4 flex gap-3 items-center">
                  <div className="size-11 rounded-2xl bg-[#EDF6EF] ring-1 ring-[#7AAE9A]/15 grid place-items-center text-[#3D8B5E] shrink-0">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold tracking-[0.08em] text-[#9AA3A6]">CEK TERAKHIR</p>
                    <p className="text-sm font-semibold text-[#1E2326] leading-tight truncate">Kondisi aman</p>
                    <p className="text-xs text-[#8A8F93]">28 Agustus</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full shrink-0 gap-1 text-xs" onClick={() => setTab("skrining")}>
                    Lihat <ChevronRight className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-[#1E2326]">Hari ini</p>
                  <div className="mt-2.5 rounded-2xl ring-1 ring-[#EAE6E0] overflow-hidden">
                    <div className="flex items-center gap-3 bg-white px-3 py-3">
                      <span className="size-2 rounded-full bg-[#7AAE9A] shadow-[0_0_0_4px_rgba(122,174,154,0.15)]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1E2326] leading-none">Vitamin jam 19.00</p>
                        <p className="text-xs text-[#8A8F93]">Jangan lupa, Bunda</p>
                      </div>
                      <span className="rounded-full bg-[#EAF2EC] px-2.5 py-1 text-xs font-semibold text-[#5A8A7A]">Aktif</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "skrining" && (
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

              <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] overflow-hidden shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y divide-[#F7F2EB]">
                    {skriningTab === "hamil" &&
                      [
                        { title: "Skrining Faktor Risiko Kehamilan", sub: "Skrining untuk menilai risiko dari riwayat hamil", done: true },
                        { title: "Skrining Status Gizi", sub: "Skrining untuk memantau gizi Bunda dan janin", done: false },
                        { title: "Skrining Tanda Bahaya Kehamilan", sub: "Skrining untuk mengenali tanda yang perlu segera diperiksa", done: false },
                        { title: "Skrining Preeklamsia", sub: "Skrining untuk deteksi dini tekanan darah tinggi", done: true },
                        { title: "Skrining Diabetes Gestasional", sub: "Skrining untuk cek risiko gula darah saat hamil", done: false },
                        { title: "Suasana Kesehatan Mental", sub: "Skrining untuk memantau suasana hati Bunda", done: true },
                      ].map((it) => (
                        <button key={it.title} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#FFFCF6] transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#1E2326] leading-tight">{it.title}</p>
                            <p className="text-xs text-[#8A8F93] truncate">{it.sub}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 shrink-0 ${it.done ? "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20" : "bg-[#F7F2EB] text-[#8A8F93] ring-[#EAE6E0]"}`}>
                            {it.done ? "Selesai" : "Belum"}
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
            </div>
          )}

          {tab === "edukasi" && (
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
          )}

          {tab === "tracker" && (
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
          )}

          {tab === "profil" && (
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
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-[#EAE6E0] bg-white/95 backdrop-blur-[10px] supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto flex max-w-[480px] items-center justify-around gap-1 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {[
            { id: "beranda", label: "Beranda", icon: Home },
            { id: "skrining", label: "Skrining", icon: ClipboardList },
            { id: "edukasi", label: "Belajar", icon: BookOpen },
            { id: "tracker", label: "Pengingat", icon: Bell },
            { id: "profil", label: "Saya", icon: User },
          ].map((it) => {
            const active = tab === (it.id as Tab)
            return (
              <button
                key={it.id}
                onClick={() => setTab(it.id as Tab)}
                className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium leading-none transition-colors ${active ? "bg-[#7AAE9A] text-white shadow-sm" : "text-[#8A8F93] hover:bg-[#F7F2EB]"}`}
              >
                <it.icon className={`size-[18px] ${active ? "text-white" : "text-[#7AAE9A]"}`} strokeWidth={active ? 2.2 : 1.8} />
                {it.label}
              </button>
            )
          })}
        </div>
      </nav>

      <Dialog open={showBirth} onOpenChange={setShowBirth}>
        <DialogContent className="rounded-[24px] bg-white p-0 gap-0 overflow-hidden border-0 ring-1 ring-black/10 max-w-[360px] w-[calc(100%-24px)]">
          <DialogHeader className="p-5 pb-3 text-left">
            <DialogTitle className="font-[Poppins] text-[16px] font-semibold text-[#1E2326] flex items-center gap-2">
              <Baby className="size-4 text-[#7AAE9A]" /> Sudah melahirkan
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#8A8F93]">Isi tanggal dan data bayi agar kami dapat membuka cek nifas dan bayi.</DialogDescription>
          </DialogHeader>
          <div className="px-5 pb-3 space-y-3">
            <img src="/illu/illu-09-dialog.png" alt="Ibu memeluk bayi dengan hangat" className="h-20 w-full object-contain rounded-[16px] bg-[#F7F2EB] ring-1 ring-[#EAE6E0] p-2" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal lahir</Label>
                <Input type="date" defaultValue="2026-08-30" className="rounded-xl bg-[#FFFCF6]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jam lahir</Label>
                <Input type="time" defaultValue="02.15" className="rounded-xl bg-[#FFFCF6]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Berat lahir gram</Label>
                <Input type="number" defaultValue="3200" className="rounded-xl bg-[#FFFCF6]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Panjang lahir sentimeter</Label>
                <Input type="number" defaultValue="49" className="rounded-xl bg-[#FFFCF6]" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 p-4 bg-[#FFFCF6] border-t border-[#EAE6E0]">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setShowBirth(false)}>
              Batal
            </Button>
            <Button
              className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] gap-1.5"
              onClick={() => {
                setIsPostpartum(true)
                setShowBirth(false)
                setTab("beranda")
              }}
            >
              Simpan <Check className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
