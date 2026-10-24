export type ResultEducationTopic = "bahaya" | "psikologi"

export type ResultEducationLink = { topic: ResultEducationTopic; title: string }

const relatedTopics: Record<string, ResultEducationLink> = {
  danger: { topic: "bahaya", title: "Tanda Bahaya Kehamilan" },
  preeklamsia: { topic: "bahaya", title: "Tanda Bahaya Kehamilan" },
  mental: { topic: "psikologi", title: "Perubahan Psikologi/Emosi" },
}

export function getEducationLinkForResult(resultType: string): ResultEducationLink | null {
  return relatedTopics[resultType] ?? null
}
