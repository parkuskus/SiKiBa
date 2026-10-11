import { useEffect, useState } from "react"
import { db } from "@/data/db"
import type { Profile } from "@/data/db"
import { getCurrentProfile, getCurrentUserId } from "@/data/currentUser"
import { weeksFromHpht } from "@/clinical-rules/ukHpl"
import { latestScreeningDraft } from "@/features/skrining/screeningDraftUtils"

type Draft = {
  loading: boolean
  userId: string
  detail: Record<string, unknown> | null
  profile: Profile | null
}

export function useLatestScreeningDraft(tipe: string): Draft {
  const [draft, setDraft] = useState<Draft>({ loading: true, userId: "", detail: null, profile: null })

  useEffect(() => {
    let active = true
    void (async () => {
      let userId = ""
      try {
        userId = await getCurrentUserId()
        const [rows, profile] = await Promise.all([
          db.screeningResults.where("userId").equals(userId).filter((row) => row.tipe === tipe).toArray(),
          getCurrentProfile().catch(() => null),
        ])
        if (active) setDraft({ loading: false, userId, detail: latestScreeningDraft(rows, userId, tipe), profile: profile?.id === userId ? profile : null })
      } catch {
        if (active) setDraft({ loading: false, userId, detail: null, profile: null })
      }
    })()
    return () => { active = false }
  }, [tipe])

  return draft
}

export function ageFromProfile(profile: Profile | null): string {
  if (!profile?.tanggal_lahir) return ""
  const birth = new Date(profile.tanggal_lahir)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
  return age >= 10 && age <= 60 ? String(age) : ""
}

export function ukFromProfile(profile: Profile | null): string {
  if (!profile?.hpht) return ""
  const weeks = weeksFromHpht(profile.hpht)
  return weeks >= 0 && weeks <= 45 ? String(weeks) : ""
}
