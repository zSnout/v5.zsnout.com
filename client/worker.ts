/** The name of the cache to use. */
let cacheID = "v1";

/** A list of files that MUST be cached. */
let files = [
  "/offline/",
  "/assets/css/index.css",
  "/assets/css/theme.css",
  "/assets/css/md.css",
  "/assets/js/index.js",
  "/assets/js/jsx.js",
  "/assets/icons/home.svg",
  "/manifest.json",
];

/** The handler for the `fetch` event. */
async function onFetch(event: WindowEventMap["fetch"]) {
  event.respondWith(
    new Promise<Response | undefined>(async (resolve) => {
      let req = event.request;
      let cache = await caches.open(cacheID);
      let cached = await cache.match(req);
      let fetched = fetch(req)
        .then(async (res) => {
          if (res.ok && req.method.toUpperCase() == "GET")
            await cache.put(req, res.clone());

          return res.clone();
        })
        .catch(async () => await cache.match("/offline/"));

      event.waitUntil(fetched);
      resolve(cached || fetched);
    })
  );
}

self.addEventListener("install", (ev) =>
  ev.waitUntil(caches.open(cacheID).then((cache) => cache.addAll(files)))
);

self.addEventListener("fetch", onFetch);

declare global {
  interface WindowEventMap {
    /** The `install` event sent to service workers. */
    install: Event & { waitUntil(operation: Promise<void>): void };

    /** The `activate` event sent to service workers. */
    activate: Event & { waitUntil(operation: Promise<void>): void };

    /** The `fetch` event sent to service workers. */
    fetch: Event & {
      request: Request;
      waitUntil(operation: Promise<any>): void;
      respondWith(
        response: Promise<Response | undefined> | Response | undefined
      ): void;
    };
  }
}

export {};
