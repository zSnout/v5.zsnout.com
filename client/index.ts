import fetch from "./assets/js/fetch.js";
import $ from "./assets/js/jsx.js";
import { getStorage, onStorageChange, setStorage } from "./assets/js/util.js";

let auth = getStorage("options:authToken");

if (auth)
  fetch(
    "/api/account-username/",
    "POST",
    { error: "boolean", username: "string" },
    { session: auth }
  ).then((result) => {
    if (result.ok) {
      $("#welcome-to-zsnout").text(
        `Welcome to zSnout, @${result.data.username}!`
      );

      $('[href="/account/login/"] strong').text("Log Out");
      $('[href="/account/login/"]')
        .attr("href", "")
        .on("click", (event) => {
          event.preventDefault();
          setStorage("options:authToken", undefined);
          location.reload();
        });
    }
  });

let clearCachePrompt =
  "Are you sure you want to clear the cache? This will remove offline capabilities of any pages you have visited. To re-enable offline mode, simply visit a page.";

let clearCacheTextEl = $('[href="#clear-cache"] strong');
let clearCache = $('[href="#clear-cache"]')
  .attr("href", "")
  .on("click", async (e) => {
    e.preventDefault();
    if (!confirm(clearCachePrompt)) return;
    (await caches.keys()).map(caches.delete.bind(caches));
  });

/**
 * Gets data from a cache.
 * @param key The cache key.
 * @returns A list of response sizes.
 */
async function getCacheData(key: string) {
  let cache = await caches.open(key);
  let keys = await cache.keys();
  let resps = await Promise.all(keys.map((key) => cache.match(key)));
  let all = resps.filter((e): e is Response => !!e);
  return Promise.all(all.map(async (e) => (await e.blob()).size));
}

/**
 * Gets data from all caches.
 * @returns A list of cached response sizes.
 */
async function getAllCacheData() {
  return caches
    .keys()
    .then((keys) => Promise.all(keys.map(getCacheData)))
    .then((data) => data.flat());
}

(async () => {
  let size = (await getAllCacheData()).reduce((a, b) => a + b, 0);
  let text = `${size} bytes`;
  if (size > 1024) text = `${(size / 1024).toFixed(2)} KB`;
  if (size > 1024 * 1024) text = `${(size / 1024 / 1024).toFixed(2)} MB`;
  clearCacheTextEl.text(`Clear ${text}`);
})();

/** Adds the current icon size onto the `main` element. */
function onResize(status = getStorage("options:iconSize")) {
  $.main
    .removeClass("icon-small", "icon-medium", "icon-large")
    .addClass(`icon-${status || "large"}`);
}

$("#icon-resize").on("click", () => {
  let status = getStorage("options:iconSize");
  if (status == "large" || !status) status = "medium";
  else if (status == "medium") status = "small";
  else status = "large";

  setStorage("options:iconSize", status);
});

onStorageChange("options:iconSize", onResize);
onResize();

declare global {
  interface StorageItems {
    "options:iconSize"?: "small" | "medium" | "large";
  }
}
