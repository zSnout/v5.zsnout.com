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
      let cache = await caches.open(cacheID);
      let cached = await cache.match(event.request);
      let fetched = fetch(event.request)
        .then((res) => {
          if (
            res.ok &&
            res.status < 400 &&
            event.request.method == "GET" &&
            res.type == "basic"
          ) {
            let clone = res.clone();
            caches
              .open(cacheID)
              .then((cache) => cache.put(event.request, clone));
          }

          return res;
        })
        .catch(
          async () =>
            (await cache.match("/offline/")) ||
            new Response(
              "Your zSnout installation is broken. Please connect to the internet to reinstall it."
            )
        );

      event.waitUntil(fetched as any);
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
      waitUntil(operation: Promise<void>): void;
      respondWith(
        response: Promise<Response | undefined> | Response | undefined
      ): void;
    };
  }
}

export {};
