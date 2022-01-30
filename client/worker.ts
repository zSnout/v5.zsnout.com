/** The name of the cache to use. */
let cacheID = "ae43b852-216c-4a60-b623-d795baa7fb6e";

/** The response to use when the user is offline. */
let offlineResp = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Oops, You're Offline!</title>
    <style nonce="%nonce%">
      :root {
        --background: #073739;
        --element: #13474b;
        --focused: #167175;
        --text-color: #fff;
        --heading-color: #a3d5d6;
        --seperator: #418183;
      }

      .theme-light {
        --background: #fff;
        --element: #e0e0e0;
        --focused: #c0c0c0;
        --text-color: #000;
        --heading-color: #13474b;
        --seperator: #13474b;
      }

      .theme-dark {
        --background: #181818;
        --element: #282828;
        --focused: #404040;
      }

      .theme-yellow-pink {
        --background: #ffffc0;
        --element: #ffc0c0;
        --focused: #cf8484;
        --text-color: #000;
        --heading-color: #900090;
        --seperator: #900090;
      }

      html, body {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: 0;
        padding: 0;
        user-select: none;
        background: var(--background);
        color: var(--text-color);
        font-family: "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Open Sans", "Helvetica Neue", sans-serif;
        text-align: center;
      }

      body {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      main {
        margin: auto;
      }

      button {
        background: var(--element);
        padding: 0.125em 0.25em;
        border-radius: 0.25em;
        color: var(--text-color);
        font-size: 1em;
        border: 0;
        line-height: 1.5;
        position: relative;
        cursor: pointer;
      }

      button:focus {
        background: var(--focused);
        text-decoration: underline;
        z-index: 1;
      }

      @media (hover: hover) {
        button:hover {
          background: var(--focused);
          text-decoration: underline;
          z-index: 1;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Oops, You're Offline!</h1>
      <p>Please connect to the internet and <button id="reload">reload the page</button>.</p>
    </main>
    <script nonce="%nonce%">
      document.getElementById("reload").onclick = () => location.reload();

      document.documentElement.classList = "theme-" + localStorage["options:theme"];
      window.onstorage = () => document.documentElement.classList = "theme-" + localStorage["options:theme"];
    </script>
  </body>
</html>`;

/**
 * Creates an offline response.
 * @returns A new offline response.
 */
function createOfflineResponse() {
  let nonce = Math.random().toString().substring(2);

  return new Response(offlineResp.replace(/%nonce%/g, nonce), {
    headers: {
      "content-security-policy": `default-src 'nonce-${nonce}'`,
      "content-type": "text/html",
    },
    status: 200,
    statusText: "OK",
  });
}

/** The handler for the `fetch` event. */
async function onFetch(event: WindowEventMap["fetch"]) {
  event.respondWith(
    new Promise<Response | undefined>(async (resolve) => {
      let req = event.request;
      if (new URL(req.url).pathname == "/offline/")
        return resolve(createOfflineResponse());

      let cache = await caches.open(cacheID);
      let cached = await cache.match(req);
      let fetched = fetch(req)
        .then(async (res) => {
          if (res.ok && req.method.toUpperCase() == "GET")
            await cache.put(req, res.clone());

          return res.clone();
        })
        .catch(createOfflineResponse);

      event.waitUntil(fetched);
      resolve(cached || fetched);
    })
  );
}

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    new Promise<void>(async (resolve) => {
      let keys = await caches.keys();
      keys.map((e) => e != cacheID && caches.delete(e));
      resolve();
    })
  );
});

self.addEventListener("fetch", onFetch);

declare global {
  interface WindowEventMap {
    /** The `install` event sent to service workers. */
    install: Event & { waitUntil(operation: Promise<any>): void };

    /** The `activate` event sent to service workers. */
    activate: Event & { waitUntil(operation: Promise<any>): void };

    /** The `fetch` event sent to service workers. */
    fetch: Event & {
      request: Request;
      waitUntil(operation: Promise<any>): void;
      respondWith(response: Promise<Response | void> | Response | void): void;
    };
  }
}

export {};
