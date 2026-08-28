import { useState } from 'react'
import { Home, ClipboardList, BookOpen, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Tab = 'beranda' | 'skrining' | 'edukasi' | 'reminder' | 'profil'

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'skrining', label: 'Skrining', icon: ClipboardList },
  { id: 'edukasi', label: 'Edukasi', icon: BookOpen },
  { id: 'reminder', label: 'Reminder', icon: Bell },
  { id: 'profil', label: 'Profil', icon: User },
]

function BerandaPlaceholder() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">S-02 Beranda — Dashboard</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          UK, HPL, progress bar, skrining terakhir, quick action. Logic <code>ukHpl.ts</code> sudah siap, FE detail menyusul.
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary text-primary-foreground"><CardContent className="pt-6 text-sm">UK 24 mg · T2 · 60%</CardContent></Card>
        <Card><CardContent className="pt-6 text-sm">Skrining terakhir: <span className="text-primary font-semibold">HIJAU</span></CardContent></Card>
      </div>
    </div>
  )
}
function SkriningPlaceholder() {
  return (
    <div className="space-y-3">
      <h2 className="font-heading font-semibold">Skrining</h2>
      <p className="text-sm text-muted-foreground">7 bumil + nifas + BBL — tap untuk buka form (FE form menyusul, logic sudah di <code>*Form.ts</code>).</p>
      {[
        'S-03a Faktor Risiko (Poedji)', 'S-03b Gizi IMT/LILA', 'S-03c Tanda Bahaya', 'S-03d Preeklamsia MAP',
        'S-03e DMG', 'S-03f Mental EPDS', 'S-04 Nifas MEOWS', 'S-05a Ikterus Kramer', 'S-05b Hipotiroid',
      ].map(t => (
        <Card key={t}><CardContent className="py-3 text-sm flex justify-between items-center">{t} <span className="text-xs bg-secondary px-2 py-1 rounded-full">logic done</span></CardContent></Card>
      ))}
    </div>
  )
}
function EdukasiPlaceholder() {
  return (
    <div className="space-y-3">
      <h2 className="font-heading font-semibold">Edukasi — S-06</h2>
      <p className="text-sm text-muted-foreground">8 topik (fertilisasi s.d. P4K). Konten dari tim klinis.</p>
      <div className="grid gap-2">
        {['Fertilisasi','Janin per minggu','Plasenta','Fisiologi','Tanda bahaya','Psikologi','Keluhan umum','Birth plan P4K'].map(x=>(
          <Card key={x}><CardContent className="py-3 text-sm">{x}</CardContent></Card>
        ))}
      </div>
    </div>
  )
}
function ReminderPlaceholder() {
  return (
    <div className="space-y-3">
      <h2 className="font-heading font-semibold">Reminder & Tracker — S-07</h2>
      <Card><CardContent className="py-4 text-sm">BB Tracker · Suplemen Fe/Folat/Ca · ANC 6x · Diary · Timeline HPL — logic done</CardContent></Card>
      <Button variant="outline" size="sm" disabled>Atur pengingat (butuh Notification API — Fase 4)</Button>
    </div>
  )
}
function ProfilPlaceholder() {
  return (
    <div className="space-y-3">
      <h2 className="font-heading font-semibold">Profil — S-08</h2>
      <Card><CardHeader><CardTitle className="text-sm">G…P…A · HPHT · Fasyankes</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Riwayat skrining + Ekspor PDF via <code>exportService.ts</code> + Pengaturan</CardContent></Card>
      <Button size="sm">Ekspor PDF (stub)</Button>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('beranda')

  return (
    <div className="min-h-svh flex flex-col bg-background max-w-[480px] mx-auto border-x border-border">
      {/* header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
        <img src="/logo-siaga-bunda.png" alt="SIGAP" className="w-9 h-9 rounded-xl bg-white p-1 object-contain" />
        <div className="leading-tight">
          <div className="font-heading font-semibold text-[15px]">SIGAP</div>
          <div className="text-[11px] opacity-90">Siaga menjaga bunda & buah hati</div>
        </div>
        <div className="ml-auto text-[10px] bg-white/20 px-2 py-1 rounded-full">PWA</div>
      </header>

      {/* content */}
      <main className="flex-1 px-4 py-4 pb-24">
        {tab === 'beranda' && <BerandaPlaceholder />}
        {tab === 'skrining' && <SkriningPlaceholder />}
        {tab === 'edukasi' && <EdukasiPlaceholder />}
        {tab === 'reminder' && <ReminderPlaceholder />}
        {tab === 'profil' && <ProfilPlaceholder />}
      </main>

      {/* bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card border-t border-border flex justify-around py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] transition-colors ${active ? 'text-primary bg-secondary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.2]' : ''}`} />
              {label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
