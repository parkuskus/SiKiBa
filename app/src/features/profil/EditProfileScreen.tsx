import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/data/db"
import { syncProfile } from "@/data/sync"
import type { Profile } from "@/data/db"

// S-08: ubah profil (noHp dikunci — identitas auth)
export default function EditProfileScreen({ profile, onBack, onSaved }: { profile: Profile; onBack: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    nama: profile.nama,
    tanggal_lahir: profile.tanggal_lahir,
    hpht: profile.hpht,
    gravida: profile.gravida,
    para: profile.para,
    abortus: profile.abortus,
    fasyankes: profile.fasyankes,
    nama_bidan: profile.nama_bidan,
  })
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setErr(null)
    if (!form.nama.trim()) return setErr("Nama wajib diisi")
    if (!form.hpht) return setErr("HPHT wajib diisi")
    if (new Date(form.hpht) > new Date()) return setErr("HPHT tidak boleh di masa depan")
    if (form.para > form.gravida) return setErr("Para tidak boleh lebih dari gravida")
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const row: Profile = { ...profile, nama: form.nama.trim(), tanggal_lahir: form.tanggal_lahir, hpht: form.hpht, gravida: Number(form.gravida), para: Number(form.para), abortus: Number(form.abortus), fasyankes: form.fasyankes, nama_bidan: form.nama_bidan, updatedAt: now }
      await db.profiles.put(row)
      syncProfile({ id: row.id, nama: row.nama, tanggal_lahir: row.tanggal_lahir, hpht: row.hpht, gravida: row.gravida, para: row.para, abortus: row.abortus, fasyankes: row.fasyankes, nama_bidan: row.nama_bidan, noHp: row.noHp })
      onSaved()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <button onClick={onBack} aria-label="Kembali" className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-[#EAE6E0] text-[#6C757D] hover:bg-[#FFFCF6] active:scale-[0.98] transition">
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">Ubah Profil</h1>
      </div>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Nama Bunda</Label>
            <Input value={form.nama} onChange={(e) => setForm((s) => ({ ...s, nama: e.target.value }))} className="rounded-full bg-white px-4" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tanggal lahir</Label>
              <Input type="date" value={form.tanggal_lahir} onChange={(e) => setForm((s) => ({ ...s, tanggal_lahir: e.target.value }))} className="rounded-full bg-white px-4" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">HPHT</Label>
              <Input type="date" value={form.hpht} onChange={(e) => setForm((s) => ({ ...s, hpht: e.target.value }))} className="rounded-full bg-white px-4" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Gravida</Label>
              <Input type="number" value={form.gravida} onChange={(e) => setForm((s) => ({ ...s, gravida: Number(e.target.value) }))} className="rounded-full bg-white px-4" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Para</Label>
              <Input type="number" value={form.para} onChange={(e) => setForm((s) => ({ ...s, para: Number(e.target.value) }))} className="rounded-full bg-white px-4" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Abortus</Label>
              <Input type="number" value={form.abortus} onChange={(e) => setForm((s) => ({ ...s, abortus: Number(e.target.value) }))} className="rounded-full bg-white px-4" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">No. HP (terkunci)</Label>
              <Input value={profile.noHp} disabled className="rounded-full bg-[#F7F2EB] px-4 opacity-70" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fasyankes</Label>
            <Input value={form.fasyankes} onChange={(e) => setForm((s) => ({ ...s, fasyankes: e.target.value }))} className="rounded-full bg-white px-4" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nama bidan</Label>
            <Input value={form.nama_bidan} onChange={(e) => setForm((s) => ({ ...s, nama_bidan: e.target.value }))} className="rounded-full bg-white px-4" />
          </div>

          {err && <p className="text-center text-xs text-[#E57373]">{err}</p>}

          <Button className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white py-6" disabled={loading} onClick={() => void handleSave()}>
            {loading ? "Menyimpan" : "Simpan perubahan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
