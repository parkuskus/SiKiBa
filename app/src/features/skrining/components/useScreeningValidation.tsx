import { useState } from 'react'
import { validateScreening } from '../screeningCompleteness'
import { toScreeningIssues, type ScreeningIssue } from './screeningValidationUI'

export default function useScreeningValidation(tipe: string, input: Record<string, unknown>, labels: Record<string, string>, instructions: Record<string, string> = {}) {
  const [attemptedKeys, setAttemptedKeys] = useState<string[] | null>([])
  const [open, setOpen] = useState(false)
  const [activeIssues, setActiveIssues] = useState<ScreeningIssue[]>([])
  const errors = Object.fromEntries(Object.entries(validateScreening(tipe, input))
    .filter(([key]) => attemptedKeys === null || attemptedKeys.includes(key))
    .map(([key, message]) => [key, instructions[key] ?? message]))

  const check = (keys?: string[]): boolean => {
    setAttemptedKeys((current) => current === null || !keys ? null : [...new Set([...current, ...keys])])
    const found = toScreeningIssues(validateScreening(tipe, input), labels, instructions)
      .filter((issue) => !keys || keys.includes(issue.key))
    if (!found.length) return true
    setActiveIssues(found)
    setOpen(true)
    return false
  }

  const focus = (key?: string) => {
    if (!key) return
    requestAnimationFrame(() => {
      const field = document.querySelector<HTMLElement>(`[data-screening-field="${key}"]`)
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const group = field?.matches('h1, h2, h3, p') ? field.parentElement : field
      const target = group?.matches('input, button') ? group : group?.querySelector<HTMLElement>('input:not([readonly]), button')
      target?.focus({ preventScroll: true })
    })
  }

  return { errors, issues: activeIssues, open, setOpen, check, focus }
}
