import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ScreeningIssue } from './screeningValidationUI'

export default function ScreeningValidationSheet({ issues, open, onOpenChange, onComplete }: {
  issues: ScreeningIssue[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="!left-1/2 !top-auto !bottom-0 !w-full !max-w-[480px] !-translate-x-1/2 !translate-y-0 gap-0 rounded-b-none rounded-t-[32px] border-0 bg-[#FFFCF6] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#B8C9C1]" aria-hidden="true" />
        <DialogTitle className="text-lg font-bold text-[#1D2B29]">Data belum lengkap</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-[#33443F]">Periksa isian berikut sebelum melihat hasil.</DialogDescription>
        <div className="my-4 max-h-[45dvh] space-y-2 overflow-y-auto" role="list">
          {issues.map((issue) => (
            <div key={issue.key} role="listitem" className="rounded-[16px] bg-[#EAF4F0] p-3">
              <p className="text-sm font-bold text-[#1D2B29]">{issue.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#33443F]">{issue.instruction}</p>
            </div>
          ))}
        </div>
        <Button type="button" className="min-h-12 w-full rounded-full bg-[#4A6E54] text-sm font-bold text-white" onClick={onComplete}>Lengkapi data</Button>
      </DialogContent>
    </Dialog>
  )
}

export function ScreeningMarker({ error, id }: { error?: string; id?: string }) {
  return error ? <span id={id} className="ml-1 text-sm font-bold text-[#C62828]"><span aria-hidden="true">*</span><span className="sr-only"> Perlu diperbaiki. {error}</span></span> : null
}
