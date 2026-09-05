import { ShieldCheck, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  label: string
  dateLabel: string
  onLihat: () => void
}

// S-02c LastSkrCard — status skrining terakhir
export default function LastCheckCard({ label, dateLabel, onLihat }: Props) {
  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-[0_10px_24px_-16px_rgba(34,28,22,0.10)] overflow-hidden">
      <CardContent className="p-4 flex gap-3 items-center">
        <div className="size-11 rounded-2xl bg-[#EDF6EF] ring-1 ring-[#7AAE9A]/15 grid place-items-center text-[#3D8B5E] shrink-0">
          <ShieldCheck className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1E2326] leading-tight truncate">{label}</p>
          <p className="text-xs text-[#8A8F93]">{dateLabel}</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full shrink-0 gap-1 text-xs" onClick={onLihat}>
          Lihat <ChevronRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}
