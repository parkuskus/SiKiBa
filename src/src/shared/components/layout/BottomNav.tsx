import { Home, ClipboardList, BookOpen, Bell, User } from "lucide-react"

type Tab = "beranda" | "skrining" | "edukasi" | "tracker" | "profil"

export default function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-[#EAE6E0] bg-white/95 backdrop-blur-[10px] supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex max-w-[480px] items-center justify-around gap-1 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {[
          { id: "beranda", label: "Beranda", icon: Home },
          { id: "skrining", label: "Skrining", icon: ClipboardList },
          { id: "edukasi", label: "Belajar", icon: BookOpen },
          { id: "tracker", label: "Pengingat", icon: Bell },
          { id: "profil", label: "Saya", icon: User },
        ].map((it) => {
          const isActive = active === (it.id as Tab)
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id as Tab)}
              className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium leading-none transition-colors ${isActive ? "bg-[#7AAE9A] text-white shadow-sm" : "text-[#8A8F93] hover:bg-[#F7F2EB]"}`}
            >
              <it.icon className={`size-[18px] ${isActive ? "text-white" : "text-[#7AAE9A]"}`} strokeWidth={isActive ? 2.2 : 1.8} />
              {it.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
