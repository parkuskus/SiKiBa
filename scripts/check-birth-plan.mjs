import assert from 'node:assert/strict'
import { parseEstimasiDana, sameBirthPlanContent } from '../app/src/features/beranda/birthPlanUtils.ts'

assert.equal(parseEstimasiDana(0), 0)
assert.equal(parseEstimasiDana('1250000'), 1250000)
assert.equal(parseEstimasiDana(null), null)
assert.equal(parseEstimasiDana(''), null)
assert.equal(parseEstimasiDana('-1'), null)

const base = {
  penolong: '', tempatBersalin: '', pendamping: '', hpBidanSiaga: '',
  donor1Nama: '', donor1GolonganDarah: '', donor2Nama: '', donor2GolonganDarah: '',
  transportasi: '', estimasiDana: 750000, danaDikonfirmasi: true,
  checklistPerlengkapan: { tasPersalinan: true, bukuKia: false },
  tandaPersalinanDipahami: { ketubanPecah: true }, createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z', id: 'user-a', userId: 'user-a',
}
assert.equal(sameBirthPlanContent(base, { ...base, updatedAt: '2026-10-02T00:00:00.000Z' }), true)
assert.equal(sameBirthPlanContent(base, { ...base, estimasiDana: 800000 }), false)
assert.equal(sameBirthPlanContent(base, { ...base, estimasiDana: null, danaDikonfirmasi: false }), false)
console.log('Birth Plan preserves zero/amount parsing and detects content conflicts separately from timestamps.')
