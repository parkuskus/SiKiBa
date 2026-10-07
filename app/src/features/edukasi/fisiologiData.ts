import {
  Activity,
  Apple,
  Baby,
  Bone,
  Droplets,
  HeartPulse,
  Milk,
  ScanFace,
  ShieldCheck,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react"

export type FisiologiGroup = "Organ dan sirkulasi" | "Pencernaan dan hormon" | "Kulit, otot, dan imun"

export type FisiologiSystem = {
  id: string
  title: string
  group: FisiologiGroup
  image: string
  icon: LucideIcon
  summary: string
  details: string
  terms: string[]
  tip?: string
}

export const fisiologiGroups: FisiologiGroup[] = [
  "Organ dan sirkulasi",
  "Pencernaan dan hormon",
  "Kulit, otot, dan imun",
]

export const fisiologiSystems: FisiologiSystem[] = [
  {
    id: "reproduksi",
    title: "Rahim dan area intim",
    group: "Organ dan sirkulasi",
    image: "/s-06/s-06d/Rahim.webp",
    icon: Baby,
    summary: "Rahim membesar dan aliran darah ke area reproduksi meningkat.",
    details: "Serviks dapat menjadi lebih lunak. Vagina dan perineum mengalami peningkatan aliran darah, sementara perubahan hormon memengaruhi sekresi. Selama kehamilan, ovulasi berhenti.",
    terms: ["rahim", "serviks", "vagina", "keputihan", "vulva", "ovarium", "chadwick", "area intim"],
    tip: "Gunakan pakaian dalam yang nyaman dan menyerap keringat.",
  },
  {
    id: "kardiovaskular",
    title: "Jantung dan pembuluh darah",
    group: "Organ dan sirkulasi",
    image: "/s-06/s-06d/Jantung.webp",
    icon: HeartPulse,
    summary: "Sirkulasi darah dan kerja jantung menyesuaikan selama kehamilan.",
    details: "Volume darah bertambah. Denyut jantung, curah jantung, dan tekanan darah dapat berubah seiring pertumbuhan rahim dan kebutuhan ibu serta janin.",
    terms: ["jantung", "detak", "denyut", "pembuluh", "darah", "terlentang", "pusing", "tekanan darah"],
    tip: "Bicarakan posisi istirahat yang nyaman dengan bidan atau dokter, terutama saat kehamilan bertambah besar.",
  },
  {
    id: "darah",
    title: "Darah Bunda",
    group: "Organ dan sirkulasi",
    image: "/s-06/s-06d/Darah.webp",
    icon: Droplets,
    summary: "Volume plasma bertambah lebih banyak dibandingkan sel darah merah.",
    details: "Perbedaan peningkatan plasma dan sel darah merah dapat membuat konsentrasi hemoglobin serta hematokrit sedikit menurun. Materi sumber menyebut perubahan ini sebagai hemodilusi fisiologis.",
    terms: ["darah", "plasma", "hemoglobin", "hematokrit", "anemia", "zat besi", "lemas", "pucat"],
    tip: "Konsumsi tablet tambah darah sesuai anjuran bidan atau dokter.",
  },
  {
    id: "pernapasan",
    title: "Paru-paru",
    group: "Organ dan sirkulasi",
    image: "/s-06/s-06d/Paru-paru.webp",
    icon: Wind,
    summary: "Rahim yang membesar dapat mendorong posisi diafragma ke atas.",
    details: "Kebutuhan oksigen dan pola ventilasi berubah selama kehamilan. Sebagian Bunda dapat merasa napas lebih pendek, terutama saat beraktivitas.",
    terms: ["paru", "napas", "sesak", "diafragma", "oksigen", "respirasi", "hiperventilasi"],
  },
  {
    id: "pencernaan",
    title: "Sistem pencernaan",
    group: "Pencernaan dan hormon",
    image: "/s-06/s-06d/Lambung.webp",
    icon: Apple,
    summary: "Perubahan hormon dan tekanan rahim dapat memengaruhi saluran cerna.",
    details: "Progesteron dapat memperlambat gerakan usus. Rahim yang membesar juga mengubah posisi lambung dan usus, sehingga konstipasi atau refluks dapat terasa.",
    terms: ["pencernaan", "lambung", "sembelit", "konstipasi", "heartburn", "maag", "usus", "kembung"],
    tip: "Materi sumber menyarankan makanan berserat dan asupan cairan yang cukup.",
  },
  {
    id: "perkemihan",
    title: "Ginjal dan kandung kemih",
    group: "Pencernaan dan hormon",
    image: "/s-06/s-06d/Ginjal.webp",
    icon: Waves,
    summary: "Aliran darah ke ginjal dan laju filtrasi berubah selama kehamilan.",
    details: "Perubahan fungsi ginjal serta tekanan rahim pada kandung kemih dapat membuat Bunda lebih sering buang air kecil.",
    terms: ["ginjal", "kandung kemih", "sering pipis", "sering BAK", "kencing", "GFR", "ureter", "ISK"],
    tip: "Jangan menahan buang air kecil. Konsultasikan rasa nyeri atau panas saat berkemih.",
  },
  {
    id: "metabolisme",
    title: "Metabolisme dan tiroid",
    group: "Pencernaan dan hormon",
    image: "/s-06/s-06d/Tiroid.webp",
    icon: Activity,
    summary: "Hormon kehamilan memengaruhi metabolisme dan fungsi tiroid.",
    details: "Perubahan metabolisme glukosa dan lipid terjadi selama kehamilan. Kebutuhan janin terhadap glukosa dan perubahan hormon dapat memengaruhi kadar gula serta kerja tiroid.",
    terms: ["metabolisme", "tiroid", "glukosa", "gula darah", "lipid", "insulin", "hormon", "diabetes gestasional"],
  },
  {
    id: "payudara",
    title: "Payudara dan persiapan ASI",
    group: "Pencernaan dan hormon",
    image: "/s-06/s-06d/Payudara.webp",
    icon: Milk,
    summary: "Payudara mengalami perubahan untuk mempersiapkan proses laktasi.",
    details: "Jaringan kelenjar payudara berkembang. Puting dan areola dapat berubah, pembuluh darah lebih terlihat, dan kolostrum dapat muncul menjelang akhir kehamilan.",
    terms: ["payudara", "ASI", "kolostrum", "areola", "puting", "laktasi", "mammogenesis"],
  },
  {
    id: "muskuloskeletal",
    title: "Otot, tulang, dan sendi",
    group: "Kulit, otot, dan imun",
    image: "/s-06/s-06d/Tulang.webp",
    icon: Bone,
    summary: "Perubahan hormon dan pertumbuhan janin memengaruhi postur serta sendi.",
    details: "Relaksin membantu melonggarkan sendi panggul. Perubahan postur untuk menyesuaikan pertumbuhan perut dapat membuat punggung bawah terasa pegal.",
    terms: ["otot", "tulang", "sendi", "punggung", "pinggang", "lordosis", "relaksin", "kram"],
    tip: "Pilih alas kaki yang nyaman dan posisi duduk yang menopang punggung.",
  },
  {
    id: "kulit-rambut",
    title: "Kulit dan rambut",
    group: "Kulit, otot, dan imun",
    image: "/s-06/s-06d/Kulit.webp",
    icon: ScanFace,
    summary: "Perubahan hormon dapat memengaruhi pigmentasi dan kondisi kulit.",
    details: "Perubahan yang dibahas pada materi meliputi hiperpigmentasi, melasma, striae, eritema palmar, linea nigra, serta spider telangiectases.",
    terms: ["kulit", "rambut", "melasma", "kloasma", "linea nigra", "stretch mark", "striae", "gatal", "pigmentasi"],
  },
  {
    id: "imun",
    title: "Sistem imun",
    group: "Kulit, otot, dan imun",
    image: "/s-06/s-06d/Imun.webp",
    icon: ShieldCheck,
    summary: "Sistem imun beradaptasi selama kehamilan.",
    details: "Materi sumber menjelaskan bahwa sistem kekebalan tubuh berubah untuk mendukung kehamilan. Perubahan ini dapat memengaruhi respons tubuh terhadap infeksi.",
    terms: ["imun", "kekebalan", "infeksi", "flu", "daya tahan", "sistem kekebalan"],
  },
]
