import { useEffect, useState } from "react"
import { db, type Profile } from "@/data/db"
import { supabase } from "@/data/supabase"

export default function ProfileAvatar({ profile }: { profile: Profile | null }) {
  const [url, setUrl] = useState("")
  useEffect(() => {
    let cancelled = false
    let objectUrl = ""
    setUrl("")
    void (async () => {
      let blob = profile?.avatarBlob
      if (!blob && profile?.avatarPath) {
        const { data, error } = await supabase.storage.from("profile-avatars").download(profile.avatarPath)
        if (!error && data && !cancelled) {
          blob = data
          await db.profiles.update(profile.id, { avatarBlob: data })
        }
      }
      if (blob && !cancelled) {
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      }
    })().catch(() => {})
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [profile?.id, profile?.avatarPath, profile?.avatarBlob])
  return url
    ? <img src={url} alt="" className="size-full rounded-full object-cover" />
    : <span aria-hidden="true" className="font-bold">{profile?.nama?.charAt(0).toUpperCase() || "B"}</span>
}
