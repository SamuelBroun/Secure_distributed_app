// PLAYERMIND – Service Worker
// תומך בהתקנה כ-PWA, מטמון בסיסי ובהתראות Push.

const CACHE = "playermind-v1";
const ASSETS = ["/", "/index.html", "/manifest.json", "/icons/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith("http")) return;
  // Network-first עבור ניווט, cache fallback אחרת
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html")),
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});

// התראות Push (כשמוגדר שרת Push בעתיד)
self.addEventListener("push", (event) => {
  let data = { title: "PLAYERMIND", body: "תזכורת חדשה" };
  try { if (event.data) data = event.data.json(); } catch (_e) { /* ignore */ }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/logo-192.png",
      badge: "/icons/logo-192.png",
      dir: "rtl",
      lang: "he",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});
