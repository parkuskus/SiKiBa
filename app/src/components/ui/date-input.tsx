import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type Props = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  value: string
  onChange: (value: string) => void
}

export function DateInput({ value, onChange, className, ...props }: Props) {
  const [year, month, day] = value.split("-")
  const displayValue = year && month && day ? `${day}/${month}/${year}` : "DD/MM/YYYY"

  return (
    <div className={cn("relative flex min-h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50", className)}>
      <span className={cn("pointer-events-none truncate", !value && "text-muted-foreground")} aria-hidden="true">{displayValue}</span>
      <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-[#4A6E54]" />
      <Input
        {...props}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  )
}
