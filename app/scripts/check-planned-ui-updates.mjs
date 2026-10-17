import assert from "node:assert/strict"
import { readFile, access } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = async (path) => readFile(resolve(root, path), "utf8")
const exists = (path) => access(resolve(root, path))

const [menu, education, homeCard, diary, diaryHistory, dmg, dmgForm, agents, imd, labor] = await Promise.all([
  source("src/features/edukasi/EdukasiMenuScreen.tsx"),
  source("src/features/edukasi/EdukasiPage.tsx"),
  source("src/features/beranda/components/ProfileCard.tsx"),
  source("src/features/tracker/PengingatPage.tsx"),
  source("src/features/tracker/DiaryHistory.tsx"),
  source("src/features/skrining/ibu-hamil/DmgScreen.tsx"),
  source("src/features/skrining/ibu-hamil/dmgForm.ts"),
  readFile(resolve(root, "../AGENTS.md"), "utf8"),
  source("src/features/edukasi/ImdScreen.tsx"),
  source("src/features/edukasi/TandaPersalinanScreen.tsx"),
])
const { calcIMT } = await import("../src/clinical-rules/imtLila.ts")

assert.match(menu, /judul: "IMD"/)
assert.match(menu, /Tanda Persalinan/)
assert.match(education, /ImdScreen/)
assert.match(education, /TandaPersalinanScreen/)
for (const path of [
  "public/s-06/s-06g/imd-hero.webp",
  "public/s-06/s-06g/manfaat-bayi.webp",
  "public/s-06/s-06g/manfaat-ibu.webp",
  "public/s-06/s-06h/hero-persiapan.webp",
  "public/s-06/s-06h/ketuban-keluar.webp",
  "public/s-06/s-06h/kontraksi.webp",
  "public/s-06/s-06h/lendir-campur-darah.webp",
]) await exists(path)

assert.match(homeCard, /Hamil, Bersalin, dan Keguguran/)
assert.doesNotMatch(diary, /Skala 1-5|\[1, 2, 3, 4, 5\]/)
assert.doesNotMatch(diaryHistory, /entry\.mood/)
assert.match(diary, /mood: 3/)
assert.match(dmg, /calcIMT/)
assert.match(dmg, /BB sebelum hamil/)
assert.match(dmg, /Tinggi badan/)
assert.match(dmg, /readOnly/)
assert.match(dmg, /Number\(form\.bbPreKg\) <= 0/)
assert.match(dmg, /Number\(form\.tbCm\) <= 0/)
assert.match(dmgForm, /imtPre > 30/)
assert.match(agents, /Markdown screen plans and `docs\/DESIGN\.md` are sufficient design references; Figma is optional/)
assert.equal(calcIMT(64, 160), 25)
assert.match(imd, /<details/)
assert.doesNotMatch(imd, /IMD merupakan langkah awal untuk mendukung keberhasilan menyusui/)
assert.match(labor, /<details/)
assert.doesNotMatch(labor, /4–5 menit baca|>Persalinan<\/span>/)
assert.match(labor, /list-decimal/)
assert.match(labor, /<\/div>\s*<p className="mt-3 text-sm font-semibold leading-relaxed text-\[#8E2424\]">Jangan menunggu/)
assert.match(labor, /mt-5 text-sm leading-relaxed text-\[#33443F\]">Persiapan yang baik/)
assert.match(labor, /object-contain/)
assert.match(homeCard, /Hamil, Bersalin, dan Keguguran/)

console.log("Planned UI update checks passed")
