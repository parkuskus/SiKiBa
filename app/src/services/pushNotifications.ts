import { supabase } from "@/data/supabase"
import { db } from "@/data/db"
import { syncAnc, syncDose, syncSupplement, flushSyncQueue } from "@/data/sync"

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
  if (!VAPID_PUBLIC_KEY || userId.startsWith("demo-") || !supportsPush()) return false
  const registration = await activeRegistration()
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return false
  const { data } = await supabase.from("push_subscriptions").select("id").eq("user_id", userId).eq("endpoint", subscription.endpoint).maybeSingle()
  return Boolean(data)
}

export async function enablePushNotifications(userId: string) {
  if (!supportsPush()) {
    throw new Error("Browser ini belum mendukung push notification")
  }
  if (!VAPID_PUBLIC_KEY) throw new Error("Push server belum dikonfigurasi")
  if (userId.startsWith("demo-")) throw new Error("Akun demo lokal tidak menggunakan push server")

  const permission = await Notification.requestPermission()
  if (permission !== "granted") throw new Error("Izin notifikasi belum diberikan")
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user || session.user.id !== userId) throw new Error("Masuk ke akun untuk mengaktifkan push notification")

  const registration = await activeRegistration()
  const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidBytes(VAPID_PUBLIC_KEY) as BufferSource,
  })
  const json = subscription.toJSON()
  if (!json.keys?.p256dh || !json.keys.auth) throw new Error("Data langganan push tidak lengkap")

  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: userId,
    endpoint: subscription.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    user_agent: navigator.userAgent,
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    updated_at: new Date().toISOString(),
  }, { onConflict: "endpoint" })
  if (error) throw error
  // Existing local reminders also need their complete schedules on the server.
  const [medicines, visits, doses] = await Promise.all([
    db.supplementReminders.where('userId').equals(userId).toArray(),
    db.ancVisits.where('userId').equals(userId).toArray(),
    db.doseLogs.where('userId').equals(userId).toArray(),
  ])
  await Promise.all([...medicines.map(syncSupplement), ...visits.map(syncAnc), ...doses.map(syncDose)])
  await flushSyncQueue()
}

export async function disablePushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint).eq("user_id", session.user.id)
    if (error) throw error
  }
  await subscription.unsubscribe()
}
