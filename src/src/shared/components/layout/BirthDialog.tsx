import { useState } from "react"
import { Baby, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BirthDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: { tanggal: string; jam: string; bb: number; pb: number }) => void
}) {
  const [tanggal, setTanggal] = useState("2026-08-30")
  const [jam, setJam] = useState("02:15")
  const [bb, setBb] = useState("3200")
  const [pb, setPb] = useState("49")
  const [err, setErr] = useState<string | null>(null)

  const handleSave = () => {
    const bbNum = Number(bb)
    const pbNum = Number(pb)
    if (!tanggal) return setErr("Tanggal lahir wajib diisi")
    if (bbNum < 1000 || bbNum > 6000) return setErr("Berat lahir 1000–6000 gram")
    if (pbNum < 30 || pbNum > 60) return setErr("Panjang lahir 30–60 cm")
    setErr(null)
    onSave({ tanggal, jam, bb: bbNum, pb: pbNum })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px] bg-white p-0 gap-0 overflow-hidden border-0 ring-1 ring-black/10 max-w-[360px] w-[calc(100%-24px)]">
        <DialogHeader className="p-5 pb-3 text-left">
          <DialogTitle className="text-[16px] font-semibold text-[#1E2326] flex items-center gap-2">
            <Baby className="size-4 text-[#7AAE9A]" /> Sudah melahirkan
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#8A8F93]">Isi tanggal dan data bayi agar kami dapat membuka cek nifas dan bayi.</DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-3 space-y-3">
          <img src="/illu/illu-09-dialog.png" alt="Ibu memeluk bayi dengan hangat" className="h-20 w-full object-contain rounded-[16px] bg-[#F7F2EB] ring-1 ring-[#EAE6E0] p-2" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tanggal lahir</Label>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="rounded-xl bg-[#FFFCF6]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Jam lahir</Label>
              <Input type="time" value={jam} onChange={(e) => setJam(e.target.value)} className="rounded-xl bg-[#FFFCF6]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Berat lahir gram</Label>
              <Input type="number" value={bb} onChange={(e) => setBb(e.target.value)} className="rounded-xl bg-[#FFFCF6]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Panjang lahir sentimeter</Label>
              <Input type="number" value={pb} onChange={(e) => setPb(e.target.value)} className="rounded-xl bg-[#FFFCF6]" />
            </div>
          </div>
          {err && <p className="text-xs text-[#E57373] text-center">{err}</p>}
        </div>
        <div className="flex gap-2 p-4 bg-[#FFFCF6] border-t border-[#EAE6E0]">
          <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] gap-1.5" onClick={handleSave}>
            Simpan <Check className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
