import { ChevronLeft } from "lucide-react"

export default function SkriningFormShell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string
  subtitle: string
  onBack: () => void
  children: React.ReactNode
}) {
  return (
    <div className="-mx-4 -mt-5 flex min-h-[100dvh] flex-col bg-[#FFFCF6]">
      <header className="mx-auto flex w-full max-w-[480px] shrink-0 items-center gap-2.5 rounded-b-[32px] bg-[#4A6E54] px-6 pb-12 pt-[max(1.75rem,env(safe-area-inset-top))]">
        <button onClick={onBack} aria-label="Kembali" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/95 text-[#DB2777] transition-transform active:scale-95">
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1 text-white">
          <h1 className="!m-0 text-lg font-bold leading-tight">{title}</h1>
          <p className="mt-0.5 text-xs leading-normal">{subtitle}</p>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 pb-5 pt-5">{children}</div>
      <div className="relative mx-auto mt-auto w-full max-w-[480px]">
        <img src="/illu/illu-11-florist-2.png" alt="" aria-hidden className="pointer-events-none w-full select-none object-cover" />
      </div>
    </div>
  )
}
