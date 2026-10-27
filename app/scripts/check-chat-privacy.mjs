import assert from 'node:assert/strict'

let privacy
let context
let chatRequest
try { privacy = await import('../src/services/chatPrivacy.ts') } catch {}
try { context = await import('../../supabase/functions/_shared/chatContext.ts') } catch {}
try { chatRequest = await import('../../supabase/functions/_shared/chatRequest.ts') } catch {}

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

assert.ok(chatRequest?.parseChatPayload, 'chat payload validation must be implemented')
assert.deepEqual(chatRequest.parseChatPayload({ message: 'pertanyaan', history: [{ role: 'user', content: 'sebelumnya' }], externalConsent: true }), {
  message: 'pertanyaan',
  history: [{ role: 'user', content: 'sebelumnya' }],
  externalConsent: true,
  hasRedResult: false,
}, 'valid request keeps only bounded chat fields')
assert.equal(chatRequest.parseChatPayload({ message: 'x'.repeat(chatRequest.MAX_CHAT_MESSAGE_CHARS) }).message.length, chatRequest.MAX_CHAT_MESSAGE_CHARS)
assert.throws(() => chatRequest.parseChatPayload({ message: 'x'.repeat(2001) }), /message terlalu panjang/)
assert.throws(() => chatRequest.parseChatPayload({ message: 'x', history: Array(7).fill({ role: 'user', content: 'x' }) }), /riwayat terlalu panjang/)
assert.throws(() => chatRequest.parseChatPayload({ message: 'x', history: [{ role: 'user', content: 'x'.repeat(1001) }] }), /riwayat terlalu panjang/)
assert.equal(chatRequest.minimizeExternalText('Hubungi 0812-3456-7890 atau bunda@example.id'), 'Hubungi [nomor telepon disamarkan] atau [email disamarkan]')
assert.throws(() => chatRequest.requireExternalConsent(false), /persetujuan diperlukan/)
assert.doesNotThrow(() => chatRequest.requireExternalConsent(true))
await assert.rejects(
  chatRequest.readBoundedJson(new Request('https://localhost/chat', { method: 'POST', body: 'x'.repeat(chatRequest.MAX_CHAT_BODY_BYTES + 1) })),
  (error) => error.status === 413,
  'oversized streamed request bodies must be rejected before JSON parsing',
)

console.log('Chat consent, minimized context, and request limits verified')
