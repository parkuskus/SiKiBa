import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import webpush from "npm:web-push@3.6.7";
import { daysUntil, localDateTime, medicineTimes, normalizeTime, type MedicineSchedule } from "../_shared/reminderSchedule.ts";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

type PushSub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string; time_zone: string };
type Delivery = { key: string; title: string; body: string; ttl: number };

// Subscription endpoints are browser-generated. Never send service-role requests to arbitrary URLs.
function trustedEndpoint(endpoint: string) {
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && !url.port && !url.username && !url.password && (
      url.hostname === "fcm.googleapis.com" || url.hostname === "web.push.apple.com" ||
      url.hostname.endsWith(".push.services.mozilla.com") || url.hostname.endsWith(".notify.windows.com")
    );
  } catch { return false; }
}

async function sendOnce(subscription: PushSub, delivery: Delivery) {
  // A unique per-device claim also prevents duplicates when two cron invocations overlap.
  const { error: claimError } = await db.from("reminder_deliveries")
    .insert({ subscription_id: subscription.id, delivery_key: delivery.key });
  if (claimError?.code === "23505") return false;
  if (claimError) throw claimError;
  try {
    await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify({
      title: delivery.title, body: delivery.body, url: "/?tab=tracker", tag: delivery.key,
    }), { TTL: delivery.ttl, timeout: 10000 });
    return true;
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await db.from("push_subscriptions").delete().eq("id", subscription.id);
    } else {
      await db.from("reminder_deliveries").delete().eq("subscription_id", subscription.id).eq("delivery_key", delivery.key);
      console.error("[push] delivery failed", statusCode ?? "network");
    }
    return false;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = request.headers.get("x-reminder-secret");
  if (!secret) return new Response("Unauthorized", { status: 401 });
  const { data: authorized, error: authError } = await db.rpc("verify_reminder_dispatch", { dispatch_secret: secret });
  if (authError || authorized !== true) return new Response("Unauthorized", { status: 401 });
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const subject = Deno.env.get("VAPID_SUBJECT");
  if (!publicKey || !privateKey || !subject) return Response.json({ error: "VAPID is not configured" }, { status: 503 });

  let stage = "load-subscriptions";
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    const { data: subscriptions, error: subError } = await db.from("push_subscriptions").select("id,user_id,endpoint,p256dh,auth,time_zone");
    if (subError) throw subError;
    const now = new Date();
    let sent = 0;
    for (const subscription of (subscriptions ?? []) as PushSub[]) {
      if (!trustedEndpoint(subscription.endpoint)) continue;
      let local: { date: string; time: string };
      try { local = localDateTime(now, subscription.time_zone); } catch { continue; }
      const { date, time } = local;
      stage = "load-user-schedules";
      const [reminders, visits, doseLogs] = await Promise.all([
        db.from("supplement_reminders").select("*").eq("user_id", subscription.user_id).eq("status_aktif", true),
        db.from("anc_visits").select("id,tanggal_terjadwal").eq("user_id", subscription.user_id).eq("status_selesai", false),
        db.from("dose_logs").select("suplemen_id,waktu,status").eq("user_id", subscription.user_id).eq("tanggal", date),
      ]);
      if (reminders.error) { stage = "query-supplement-reminders"; throw reminders.error; }
      if (visits.error) { stage = "query-anc-visits"; throw visits.error; }
      if (doseLogs.error) { stage = "query-dose-logs"; throw doseLogs.error; }
      const minutes = (at: string) => Number(at.slice(0, 2)) * 60 + Number(at.slice(3, 5));
      const currentMinute = minutes(time);
      const doseStatus = new Map((doseLogs.data ?? []).map((item) => [`${item.suplemen_id}|${normalizeTime(item.waktu)}`, item.status]));

      for (const row of reminders.data ?? []) {
        const medicine: MedicineSchedule = {
          id: row.client_id ?? row.id, namaSuplemen: row.nama_suplemen, waktu: row.waktu ?? "", statusAktif: row.status_aktif,
          waktuList: row.waktu_list, frekuensi: row.frekuensi, hari: row.hari,
          tanggalMulai: row.tanggal_mulai, tanggalSelesai: row.tanggal_selesai,
        };
        for (const at of medicineTimes(medicine, date)) {
          const late = currentMinute - minutes(at);
          // ponytail: a two-minute retry window tolerates cron/network delays; no stale daily reminders.
          if (late < 0 || late > 2 || ["taken", "skip"].includes(doseStatus.get(`${medicine.id}|${at}`) ?? "")) continue;
          stage = "claim-and-send-supplement";
          if (await sendOnce(subscription, {
            key: `medicine:${medicine.id}:${date}:${at}`, title: `Waktunya ${medicine.namaSuplemen}`,
            body: `Jadwal minum pukul ${at.replace(":", ".")}. Catat setelah diminum di SIAGA Bunda.`, ttl: 120,
          })) sent++;
        }
      }

      // ANC reminders arrive at 09.00 local device time on H-2 and H-1 only.
      if (currentMinute >= 540 && currentMinute <= 542) {
        for (const visit of visits.data ?? []) {
          const daysLeft = daysUntil(date, visit.tanggal_terjadwal);
          if (daysLeft !== 1 && daysLeft !== 2) continue;
          stage = "claim-and-send-anc";
          if (await sendOnce(subscription, {
            key: `anc:${visit.id}:${visit.tanggal_terjadwal}:H-${daysLeft}`,
            title: "Jadwal pemeriksaan mendekat",
            body: `Pemeriksaan rutin Bunda ${daysLeft === 2 ? "dua hari lagi" : "besok"}. Siapkan buku KIA untuk kunjungan.`, ttl: 3600,
          })) sent++;
        }
      }
    }
    return Response.json({ ok: true, sent });
  } catch (error) {
    const detail = error as { code?: string; message?: string };
    console.error("[push] dispatch failed", { stage, code: detail?.code ?? "unknown", message: detail?.message ?? "unknown" });
    return Response.json({ error: "Reminder dispatch failed", stage, code: detail?.code ?? "unknown", detail: detail?.message?.slice(0, 240) ?? "unknown" }, { status: 500 });
  }
});
