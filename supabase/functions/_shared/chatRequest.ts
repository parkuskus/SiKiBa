export const MAX_CHAT_BODY_BYTES = 32 * 1024;
export const MAX_CHAT_MESSAGE_CHARS = 2000;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 1000;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE = /(?<![\p{L}\d])(?:\+62|62|0)(?:[\s().-]*\d){8,13}(?!\d)/gu;

export class ChatRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function readBoundedJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_CHAT_BODY_BYTES) {
    throw new ChatRequestError(413, "request terlalu besar");
  }

  const reader = request.body?.getReader();
  if (!reader) throw new ChatRequestError(400, "body request kosong");

  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_CHAT_BODY_BYTES) {
      await reader.cancel().catch(() => {});
      throw new ChatRequestError(413, "request terlalu besar");
    }
    chunks.push(value);
  }

  try {
    return JSON.parse(new TextDecoder().decode(concatChunks(chunks, size)));
  } catch {
    throw new ChatRequestError(400, "JSON request tidak valid");
  }
}

export function parseChatPayload(value: unknown): {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  externalConsent: boolean;
  hasRedResult: boolean;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ChatRequestError(400, "payload request tidak valid");
  const body = value as { message?: unknown; history?: unknown; externalConsent?: unknown; hasRedResult?: unknown };
  if (typeof body.message !== "string" || !body.message.trim()) throw new ChatRequestError(400, "message kosong");
  const message = body.message.trim();
  if (message.length > MAX_CHAT_MESSAGE_CHARS) throw new ChatRequestError(413, "message terlalu panjang");

  if (body.history !== undefined && !Array.isArray(body.history)) throw new ChatRequestError(400, "riwayat tidak valid");
  const inputHistory = (body.history ?? []) as unknown[];
  if (inputHistory.length > MAX_HISTORY_TURNS) throw new ChatRequestError(413, "riwayat terlalu panjang");
  const history = inputHistory.map((turn) => {
    if (!turn || typeof turn !== "object") throw new ChatRequestError(400, "riwayat tidak valid");
    const item = turn as { role?: unknown; content?: unknown };
    if ((item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string" || !item.content.trim()) {
      throw new ChatRequestError(400, "riwayat tidak valid");
    }
    const content = item.content.trim();
    if (content.length > MAX_HISTORY_CHARS) throw new ChatRequestError(413, "riwayat terlalu panjang");
    return { role: item.role as "user" | "assistant", content };
  });

  return {
    message,
    history,
    externalConsent: body.externalConsent === true,
    hasRedResult: body.hasRedResult === true,
  };
}

export function minimizeExternalText(text: string): string {
  return text.replace(EMAIL, "[email disamarkan]").replace(PHONE, "[nomor telepon disamarkan]");
}

export function requireExternalConsent(consent: unknown): void {
  if (consent !== true) throw new ChatRequestError(403, "persetujuan diperlukan sebelum memakai AI eksternal");
}

function concatChunks(chunks: Uint8Array[], size: number): Uint8Array {
  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}
