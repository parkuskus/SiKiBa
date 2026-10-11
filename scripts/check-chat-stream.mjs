import assert from "node:assert/strict"
import { consumeChatStream } from "../app/src/services/chatStream.ts"

const chunks = [
  'data: {"type":"del',
  'ta","text":"Halo B',
  'unda 👋"}\r\n\r\ndata: {"type":"done","answer":"Halo Bunda 👋","sources":["Panduan"],"verified":true,"escalate":false}\r\n\r\n',
]
const response = new Response(new ReadableStream({
  start(controller) {
    const encoder = new TextEncoder()
    for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
    controller.close()
  },
}))
const deltas = []
const result = await consumeChatStream(response, (delta) => deltas.push(delta))

assert.deepEqual(deltas, ["Halo Bunda 👋"])
assert.equal(result.answer, "Halo Bunda 👋")
assert.deepEqual(result.sources, ["Panduan"])
assert.equal(result.verified, true)
console.log("Chat SSE stream check passed")
