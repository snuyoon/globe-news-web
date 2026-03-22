/* Service Worker — 웹 푸시 알림 */

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "US속보";
  const options = {
    body: data.body || "새로운 속보가 도착했습니다",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "us-sokbo",
    data: { url: data.url || "https://globe-news-web.vercel.app/news" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "https://globe-news-web.vercel.app";
  event.waitUntil(clients.openWindow(url));
});
