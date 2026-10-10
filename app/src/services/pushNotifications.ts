import { supabase } from "@/data/supabase"
import { db } from "@/data/db"
import { syncAnc, syncDose, syncSupplement, flushSyncQueue } from "@/data/sync"
import { DEMO_USER_ID } from "@/features/onboarding/demoAccount"

const DEMO_PUSH_OWNER_KEY = "siaga_demo_push_user_id"

// Public application-server key, safe to bundle. Private VAPID material stays in Edge Secrets.
const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)
  || "BAHAtKQERFqHrx0M7CXQ4-g9KYGbxlDVlS-j51ybhsPmIUSiCVEhAj6JVqeUGYLA0ubeDW0kLmBC1LEjCJON73c"

function vapidBytes(key: string): Uint8Array {
  const padding = "=".repeat((4 - key.length % 4) % 4)
  const value = (key + padding).replace(/-/g, "+").replace(/_/g, "/")
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

export function isPushConfigured() {
  return Boolean(VAPID_PUBLIC_KEY)
}

export function supportsPush() {
  return window.isSecureContext && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window
}

async function activeRegistration() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Service worker belum aktif. Buka versi production atau pasang PWA terlebih dahulu.")), 8000)),
  ])
}

export async function isPushLinked(userId: string) {
  if (!VAPID_PUBLIC_KEY || !supportsPush()) return false
  const pushUserId = await getPushUserId(userId)
  if (!pushUserId) return false
  const registration = await activeRegistration()
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return false
  const { data } = await supabase.from("push_subscriptions").select("id").eq("user_id", pushUserId).eq("endpoint", subscription.endpoint).maybeSingle()
  return Boolean(data)
}

async function getPushUserId(userId: string) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  if (userId === DEMO_USER_ID) return session.user.is_anonymous ? session.user.id : null
  return !userId.startsWith("demo-") && session.user.id === userId ? userId : null
}

export async function enablePushNotifications(userId: string) {
  if (!supportsPush()) {
    throw new Error("Browser ini belum mendukung push notification")
  }
  if (!VAPID_PUBLIC_KEY) throw new Error("Push server belum dikonfigurasi")
  const pushUserId = await getPushUserId(userId)
  if (!pushUserId) throw new Error("Sesi akun tidak valid untuk mengaktifkan push")

  const permission = await Notification.requestPermission()
  if (permission !== "granted") throw new Error("Izin notifikasi belum diberikan")

  const registration = await activeRegistration()
  const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidBytes(VAPID_PUBLIC_KEY) as BufferSource,
  })
  const json = subscription.toJSON()
  if (!json.keys?.p256dh || !json.keys.auth) throw new Error("Data langganan push tidak lengkap")

  if (userId === DEMO_USER_ID) {
    const { error: profileError } = await supabase.from("profiles").upsert({ id: pushUserId, nama: "Akun Dummy" }, { onConflict: "id" })
    if (profileError) throw profileError
  }
  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: pushUserId,
    endpoint: subscription.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    user_agent: navigator.userAgent,
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    updated_at: new Date().toISOString(),
  }, { onConflict: "endpoint" })
  if (error) throw error
  if (userId === DEMO_USER_ID) {
    try { localStorage.setItem(DEMO_PUSH_OWNER_KEY, pushUserId) } catch {}
  }
  // Existing local reminders also need their complete schedules on the server.
  const [medicines, visits, doses] = await Promise.all([
    db.supplementReminders.where('userId').equals(userId).toArray(),
    db.ancVisits.where('userId').equals(userId).toArray(),
    db.doseLogs.where('userId').equals(userId).toArray(),
  ])
  const cloudVisits = await Promise.all(visits.map(async (visit) => {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visit.id)) return visit
    const normalized = { ...visit, id: crypto.randomUUID() }
    await db.ancVisits.delete(visit.id)
    await db.ancVisits.put(normalized)
    return normalized
  }))
  await Promise.all([
    ...medicines.map((item) => syncSupplement({ ...item, userId: pushUserId })),
    ...cloudVisits.map((item) => syncAnc({ ...item, userId: pushUserId })),
    ...doses.map((item) => syncDose({ ...item, userId: pushUserId })),
  ])
  await flushSyncQueue()
}

export async function disablePushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  const { data: { session } } = await supabase.auth.getSession()
  if (subscription && session) {
    const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint).eq("user_id", session.user.id)
    if (error) throw error
  }
  if (subscription) await subscription.unsubscribe()
  try { localStorage.removeItem(DEMO_PUSH_OWNER_KEY) } catch {}
}
