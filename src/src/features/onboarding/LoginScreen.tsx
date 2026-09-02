import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/data/db"

type Props = { onBack: () => void; onSuccess: () => void; onToRegister: () => void }

export default function LoginScreen({ onBack, onSuccess, onToRegister }: Props) {
  const [noHp, setNoHp] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setErr(null)
    if (!noHp.trim()) {
      setErr("Nomor HP wajib diisi")
      return
    }
    setLoading(true)
    try {
      const clean = noHp.replace(/[^0-9]/g, "")
      const profiles = await db.profiles.toArray()
      const found = profiles.find((p) => p.noHp === clean)
      if (!found) {
        if (profiles.length === 0) {
          setErr("Belum ada akun dengan nomor ponsel ini. Silakan daftar terlebih dahulu.")
        } else {
          setErr("Nomor tidak ditemukan. Periksa kembali nomor HP atau daftar akun baru.")
        }
        return
      }
      onSuccess()
    } catch {
      setErr("Terjadi gangguan. Coba lagi dalam beberapa saat.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFFCF6] flex flex-col">
      <div className="mx-auto w-full max-w-[480px] flex-1 px-4 pb-6 pt-4">
        <button onClick={onBack} className="size-9 rounded-full bg-white ring-1 ring-[#EAE6E0] grid place-items-center text-[#7AAE9A]">
          <ChevronRight className="size-4 rotate-180" />
        </button>

        <h1 className="mt-4 font-[Poppins] text-[20px] font-semibold text-[#1E2326] leading-tight">Masuk Akun</h1>
        <p className="mt-1 text-sm text-[#8A8F93] leading-relaxed">Masukkan nomor HP yang dipakai saat daftar. Untuk percobaan, data diambil dari penyimpanan ponsel.</p>

        <Card className="mt-4 rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nomor HP</Label>
              <Input value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="08xxxxxxxxxx" className="rounded-xl bg-[#FFFCF6]" />
            </div>

            {err && <p className="text-xs text-[#E57373] text-center">{err}</p>}

            <Button onClick={handleLogin} disabled={loading} className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] py-3.5 text-sm font-semibold">
              {loading ? "Memeriksa" : "Masuk"}
            </Button>

            <button onClick={onToRegister} className="w-full text-center text-sm font-medium text-[#7AAE9A] underline underline-offset-4 decoration-[#7AAE9A]/30">
              Belum punya akun? Daftar di sini
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
