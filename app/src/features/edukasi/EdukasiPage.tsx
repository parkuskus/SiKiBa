export default function EdukasiPage() {
  return (
    <div className="-mx-4 -mt-5">
      <header className="rounded-b-[32px] bg-[#4A6E54] px-6 pb-7 pt-7 text-white">
        <h1 className="!m-0 text-3xl font-bold leading-tight">Belajar</h1>
        <p className="mt-1 text-sm leading-relaxed text-white/90">Informasi untuk Bunda dan buah hati</p>
      </header>

      <section className="mx-4 flex min-h-[440px] flex-col items-center justify-center rounded-t-[32px] bg-[#FFFCF6] px-6 py-8 text-center">
        <span className="rounded-full bg-[#EAF4F0] px-4 py-2 text-sm font-bold text-[#4A6E54]">Segera hadir</span>
        <img src="/illu/illu-08-diary.png" alt="Ilustrasi materi belajar SIAGA Bunda" className="mt-4 h-36 w-full max-w-[200px] object-contain" />
        <h2 className="mt-4 text-lg font-bold text-[#1D2B29]">Materi belajar sedang disiapkan</h2>
        <p className="mt-2 max-w-[320px] text-sm leading-relaxed text-[#536961]">
          Konten kehamilan, masa nifas, dan perawatan bayi akan segera hadir di sini.
        </p>
      </section>
    </div>
  )
}
