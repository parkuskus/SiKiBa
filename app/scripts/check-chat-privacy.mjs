import assert from 'node:assert/strict'

let privacy
let context
try { privacy = await import('../src/services/chatPrivacy.ts') } catch {}
try { context = await import('../../supabase/functions/_shared/chatContext.ts') } catch {}

assert.ok(privacy?.requiresExternalChatConsent, 'chat consent policy must be implemented')
assert.equal(privacy.requiresExternalChatConsent(true, false), true, 'online AI needs consent by default')
assert.equal(privacy.requiresExternalChatConsent(true, true), false, 'consent allows online AI for this chat')
assert.equal(privacy.requiresExternalChatConsent(false, false), false, 'offline replies do not need external consent')

assert.ok(context?.buildExternalLlmMessages, 'external LLM context builder must be implemented')
assert.deepEqual(
  context.buildExternalLlmMessages('system', [{ role: 'user', content: 'pesan sebelumnya' }], 'pesan sekarang', ''),
  [
    { role: 'system', content: 'system' },
    { role: 'user', content: 'pesan sebelumnya' },
    { role: 'user', content: 'POTONGAN PANDUAN YANG RELEVAN:\nTidak ada potongan panduan yang cukup relevan.\n\nPERTANYAAN TERBARU BUNDA:\npesan sekarang' },
  ],
  'only the system instruction and explicitly supplied chat turns reach the LLM',
)

console.log('Consent gate and minimized LLM context verified')
