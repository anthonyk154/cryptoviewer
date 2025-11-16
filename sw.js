self.addEventListener("install", e => {
  console.log("Service Worker installed.");
});

self.addEventListener("fetch", e => {
  // Passive mode (no caching yet)
});
