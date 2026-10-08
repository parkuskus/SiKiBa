self.addEventListener("push", (event) => {
  let message = {};
  try { message = event.data ? event.data.json() : {}; } catch { message = { body: event.data?.text() ?? "" }; }
  const title = message.title || "Pengingat SIAGA Bunda";
  const options = {
    body: message.body || "Ada pengingat kesehatan untuk Bunda.",
    icon: "/logo-pwa-512x512.webp",
    badge: "/logo-pwa-512x512.webp",
    tag: message.tag || "siaga-reminder",
    data: { url: message.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const appClient = clients.find((client) => new URL(client.url).origin === self.location.origin);
    if (appClient) return appClient.navigate(target).then((client) => client?.focus());
    return self.clients.openWindow(target);
  }));
});
