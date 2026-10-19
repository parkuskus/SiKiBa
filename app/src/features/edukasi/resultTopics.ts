export type ResultEducationTopic = "bahaya" | "psikologi"

const relatedTopics: Record<string, ResultEducationTopic> = {
  danger: "bahaya",
  preeklamsia: "bahaya",
  mental: "psikologi",
}

export function getEducationTopicForResult(resultType: string): ResultEducationTopic | null {
  return relatedTopics[resultType] ?? null
}
