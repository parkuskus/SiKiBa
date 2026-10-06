import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db, type Profile } from "@/data/db"
import { supabase } from "@/data/supabase"
import { photoCrop } from "@/services/photoCrop"

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function AvatarEditor({ profile, onBack, onSaved }: { profile: Profile; onBack: () => void; onSaved: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!file) return
    let cancelled = false
    const url = URL.createObjectURL(file)
    const next = new Image()
    next.onload = () => {
      if (!cancelled) {
        if (next.naturalWidth * next.naturalHeight > 40000000) setError("Foto terlalu besar. Pilih gambar dengan resolusi lebih kecil.")
        else setImage(next)
      }
    }
    next.onerror = () => { if (!cancelled) setError("Foto tidak dapat dibuka") }
    next.src = url
    return () => { cancelled = true; URL.revokeObjectURL(url) }
  }, [file])

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d")
    if (!image || !context) return
    const { sx, sy, side } = photoCrop(image.naturalWidth, image.naturalHeight, zoom, position.x, position.y)
    context.fillStyle = "#FFFFFF"
    context.fillRect(0, 0, 512, 512)
    context.drawImage(image, sx, sy, side, side, 0, 0, 512, 512)
  }, [image, zoom, position])

  const handleFile = (selected: File | undefined) => {
    setError("")
    if (!selected) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) return setError("Pilih foto JPG, PNG, atau WebP")
    if (selected.size > MAX_FILE_SIZE) return setError("Ukuran foto maksimal 10 MB")
    setFile(selected)
    setImage(null)
    setZoom(1)
    setPosition({ x: 50, y: 50 })
  }

  const handleSave = async () => {
    if (!image || !canvasRef.current) return setError("Pilih foto terlebih dahulu")
    setSaving(true)
    setError("")
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((value) => value ? resolve(value) : reject(new Error("Foto tidak dapat diproses")), "image/jpeg", 0.88)
      })
      let avatarPath: string | undefined
      if (!profile.id.startsWith("demo-")) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user || session.user.id !== profile.id) throw new Error("Sesi akun tidak tersedia. Masuk kembali untuk menyimpan foto.")
        if (!navigator.onLine) throw new Error("Sambungkan internet untuk menyimpan foto ke akun.")
        avatarPath = `${profile.id}/avatar-${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(avatarPath, blob, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        })
        if (uploadError) throw uploadError
        const { data: updated, error: profileError } = await supabase.from("profiles").update({ avatar_path: avatarPath, updated_at: new Date().toISOString() }).eq("id", profile.id).select("id").single()
        if (profileError || !updated) {
          await supabase.storage.from("profile-avatars").remove([avatarPath])
          throw profileError ?? new Error("Profil gagal diperbarui")
        }
        if (profile.avatarPath) await supabase.storage.from("profile-avatars").remove([profile.avatarPath])
      }
      await db.profiles.put({ ...profile, avatarPath, avatarBlob: blob, updatedAt: new Date().toISOString() })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan foto")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="-mx-4 -mt-5 flex min-h-[100dvh] flex-col bg-[#FFFCF6]">
      <header className="rounded-b-[32px] bg-[#4A6E54] px-6 pb-6 pt-[max(1.75rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Kembali" className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#4A6E54]">
            <ChevronLeft className="size-5" />
          </button>
          <div>
            <h1 className="!m-0 text-xl font-bold">Foto Profil</h1>
            <p className="mt-1 text-xs text-white/90">Atur posisi dan ukuran foto</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-5 px-6 pb-6 pt-6">
        <div className="mx-auto grid size-64 max-w-full place-items-center overflow-hidden rounded-full bg-[#EAF4F0] ring-4 ring-white shadow-[0_8px_24px_-12px_rgba(29,43,41,0.3)]">
          <canvas ref={canvasRef} width={512} height={512} role="img" aria-label="Pratinjau foto profil" className={`size-full ${image ? "" : "hidden"}`} />
          {!image && <span className="text-6xl font-bold text-[#4A6E54]">{profile.nama.charAt(0).toUpperCase()}</span>}
        </div>

        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
        <Button disabled={saving} variant="outline" className="min-h-12 w-full rounded-full border-[#D9E7E2] bg-white text-[#4A6E54]" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="size-4" /> {file ? "Pilih foto lain" : "Pilih foto"}
        </Button>

        {image && (
          <div className="space-y-3 rounded-[20px] bg-[#EAF4F0] p-4 text-sm font-semibold text-[#1D2B29]">
            <label className="block">
              <span className="flex items-center justify-between"><span>Ukuran foto</span><span>{zoom.toFixed(1)}×</span></span>
              <input disabled={saving} type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="min-h-11 w-full accent-[#4A6E54]" aria-label="Atur ukuran foto" />
            </label>
            {(["x", "y"] as const).map((axis) => (
              <label key={axis} className="block">
                <span>{axis === "x" ? "Geser horizontal" : "Geser vertikal"}</span>
                <input disabled={saving} type="range" min="0" max="100" value={position[axis]} onChange={(event) => setPosition((prev) => ({ ...prev, [axis]: Number(event.target.value) }))} className="min-h-11 w-full accent-[#4A6E54]" aria-label={axis === "x" ? "Geser horizontal" : "Geser vertikal"} />
              </label>
            ))}
          </div>
        )}

        <p className="text-center text-xs leading-relaxed text-[#536961]">Sesuaikan ukuran dan posisi. Foto disimpan 512×512 piksel dan ditampilkan melingkar.</p>
        {error && <p role="alert" className="text-center text-xs text-[#C62828]">{error}</p>}
        <div className="mt-auto flex gap-2">
          <Button disabled={saving} variant="outline" className="min-h-12 flex-1 rounded-full border-[#D9E7E2] bg-white text-[#33443F]" onClick={onBack}>Batal</Button>
          <Button className="min-h-12 flex-1 rounded-full bg-[#4A6E54] font-bold text-white hover:bg-[#3D5C46]" disabled={!image || saving} onClick={() => void handleSave()}>
            {saving ? "Menyimpan" : "Simpan foto"}
          </Button>
        </div>
      </main>
    </div>
  )
}
