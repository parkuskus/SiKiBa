import assert from 'node:assert/strict'
import { latestScreeningDraft } from '../app/src/features/skrining/screeningDraftUtils.ts'

const rows = [
  { userId: 'ibu-a', tipe: 'imt_lila', createdAt: '2026-10-01T10:00:00.000Z', detail: { bbPreKg: 50 } },
  { userId: 'ibu-a', tipe: 'dmg', createdAt: '2026-10-03T10:00:00.000Z', detail: { usia: 31 } },
  { userId: 'ibu-b', tipe: 'imt_lila', createdAt: '2026-10-04T10:00:00.000Z', detail: { bbPreKg: 70 } },
  { userId: 'ibu-a', tipe: 'imt_lila', createdAt: '2026-10-05T10:00:00.000Z', detail: { bbPreKg: 54 } },
]

assert.deepEqual(latestScreeningDraft(rows, 'ibu-a', 'imt_lila'), { bbPreKg: 54 })
assert.deepEqual(latestScreeningDraft(rows, 'ibu-b', 'imt_lila'), { bbPreKg: 70 })
assert.deepEqual(latestScreeningDraft(rows, 'ibu-a', 'dmg'), { usia: 31 })
assert.equal(latestScreeningDraft(rows, 'ibu-c', 'imt_lila'), null)
console.log('Latest screening drafts are isolated by user and screening type.')
