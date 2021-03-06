const FILES_TO_CACHE = [
  "/",
  "/manifest.json",
  "/db.js",
  "/index.js",
  "/style.css",

  // update to cache multiple bundles
  "/dist/bundle.js",


];

const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.


self.addEventListener("fetch", event => {
  // non GET requests are not cached and requests to other origins are not cached


  // handle runtime GET requests for data from /api routes
  if (event.request.url.includes("/api/")) {
    // make network request and fallback to cache if network request fails (offline)
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request));
      })
        .catch(err => console.log("err"))
    );
    return;
  }

  // use cache first for all other requests for performance
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      } else if (event.request.headers.get("accept").includes("text/html")) {
        return caches.match("/")
      }


    })
  );
});
