import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CircleAlert } from 'lucide-react'
import type { ScreeningIssue } from './screeningValidationUI'

export default function ScreeningValidationSheet({ issues, open, onOpenChange, onComplete }: {
  issues: ScreeningIssue[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[calc(100%-2rem)] max-w-[360px] gap-0 rounded-[24px] border-0 bg-[#FFFCF6] p-5 text-center ring-1 ring-[#D9E7E2]">
        <span className="mx-auto grid size-14 shrink-0 place-items-center rounded-full bg-[#FDE7E5] text-[#B5473C]">
          <CircleAlert className="size-7" aria-hidden="true" />
        </span>
        <DialogTitle className="mt-4 text-lg font-bold text-[#1D2B29]">Data belum lengkap</DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-relaxed text-[#33443F]">Periksa isian berikut sebelum melihat hasil.</DialogDescription>
        <div className="my-4 max-h-[40dvh] space-y-2 overflow-y-auto text-left" role="list">
          {issues.map((issue) => (
            <div key={issue.key} role="listitem" className="rounded-[16px] bg-[#EAF4F0] p-3">
              <p className="text-sm font-bold text-[#1D2B29]">{issue.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#33443F]">{issue.instruction}</p>
            </div>
          ))}
        </div>
        <Button type="button" className="min-h-11 w-full rounded-full bg-[#4A6E54] text-sm font-bold text-white hover:bg-[#3D5C46]" onClick={onComplete}>Lengkapi data</Button>
      </DialogContent>
    </Dialog>
  )
}

export function ScreeningMarker({ error, id }: { error?: string; id?: string }) {
  return error ? <span id={id} className="ml-1 text-sm font-bold text-[#C62828]"><span aria-hidden="true">*</span><span className="sr-only"> Perlu diperbaiki. {error}</span></span> : null
}
