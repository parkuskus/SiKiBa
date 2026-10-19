import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const syncSource = await readFile('src/data/sync.ts', 'utf8')
const blockedQueueBranch = syncSource.slice(
  syncSource.indexOf("if (msg.includes('violates row-level')"),
  syncSource.indexOf('// network error → stop', syncSource.indexOf("if (msg.includes('violates row-level')")),
)
assert.doesNotMatch(blockedQueueBranch, /db\.syncQueue\.delete\(/, 'blocked sync must not silently discard locally queued data')
assert.match(blockedQueueBranch, /break/, 'blocked sync should stop this flush and retain the queue for later recovery')
const immediateAuthFailure = syncSource.slice(
  syncSource.indexOf("if (['42501'"),
  syncSource.indexOf("console.warn('[sync] blocked by authorization')") + 150,
)
assert.doesNotMatch(immediateAuthFailure, /clearDurableQueue/, 'direct authorization failures must retain durable writes')
assert.match(immediateAuthFailure, /queued\(\)/, 'authorization failures retain the outgoing payload for later retry')

const notice = await readFile('src/features/sync/SyncStatusNotice.tsx', 'utf8')
assert.match(notice, /where\(['"]userId['"]\)\.equals\(queueUserId\)/, 'status only counts this account’s queued data')
assert.match(notice, /session\?\.user\.is_anonymous[\s\S]*siaga_demo_push_user_id[\s\S]*session\.user\.id/, 'demo push queue is counted only when its owner matches the active anonymous session')
assert.match(notice, /Data tersimpan di perangkat/, 'pending writes must be described as locally retained')
assert.match(notice, /Coba lagi/, 'pending writes expose a retry action')
assert.match(notice, /aria-live/, 'sync status updates are announced to assistive technology')

console.log('Status sinkronisasi dan retensi antrean terverifikasi')
