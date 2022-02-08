import $, { jsx } from "./jsx.js";
import { createNotification } from "./notification.js";
import { getStorage, onStorageChange, setStorage } from "./util.js";

/** Gets all pages in the "Recently Visited" list. */
export function getRecentlyVisited(
  data = getStorage("options:recentlyVisited")
) {
  if (!data) return null;

  try {
    let lastVisited;
    try {
      lastVisited = JSON.parse(data);
    } catch {
      return null;
    }

    if (!Array.isArray(lastVisited)) return null;

    let complete: { href: string; title: string }[] = [];
    for (let data of lastVisited) {
      if (typeof data.href !== "string" || typeof data.title !== "string")
        continue;

      complete.push({ href: data.href, title: data.title });
    }

    return complete.slice(0, 11);
  } catch {
    return null;
  }
}

/** Checks the "Recently Visited" page list and updates the footer accordingly. */
export function checkRecentlyVisited() {
  let recentlyVisited = getRecentlyVisited();
  let footer = $("#last-visited")
    .empty()
    .append(<a href="/">Home</a>);

  if (!recentlyVisited) return;

  for (let { href, title } of recentlyVisited)
    footer.append(<a href={href}>{title}</a>);
}

/** Reset the "Recently Visited" list. */
function resetRecentlyVisited() {
  if (location.pathname != "/")
    setStorage(
      "options:recentlyVisited",
      JSON.stringify([
        {
          href: location.pathname,
          title: document.title,
        },
      ])
    );
  else setStorage("options:recentlyVisited", "[]");
}

if (new URL(location.href).searchParams.has("embed")) $.root.addClass("embed");
if (new URL(location.href).searchParams.has("nobg")) $.root.addClass("nobg");

onStorageChange("options:recentlyVisited", checkRecentlyVisited);

let hasPrompted = false;
let didInstall = getStorage("pwa:isInstalled");
if (
  !didInstall ||
  (didInstall == "false" &&
    +getStorage("pwa:lastInstallTime")! < Date.now() - 1000 * 60 * 60 * 24 * 7)
) {
  window.addEventListener("beforeinstallprompt", (event: any) => {
    if (hasPrompted) return;
    hasPrompted = true;
    let hide = createNotification(
      "Did you know you can install this app to your device? If you do, you can use it offline!",
      20000,
      {
        async Install() {
          hide();
          event.prompt();

          let { outcome } = await event.userChoice;

          if (outcome == "dismissed") setStorage("pwa:isInstalled", "false");
          else setStorage("pwa:isInstalled", "true");

          setStorage("pwa:lastInstallTime", "" + Date.now());
        },
        async Cancel() {
          hide();

          setStorage("pwa:isInstalled", "false");
          setStorage("pwa:lastInstallTime", "" + Date.now());
        },
      }
    );
  });
}

let recentlyVisited = getRecentlyVisited();

if (location.pathname == "/") {
  // skip homepage
} else if (recentlyVisited) {
  recentlyVisited = recentlyVisited.filter(
    ({ href }) => href != location.pathname
  );
  recentlyVisited.unshift({ href: location.pathname, title: document.title });
  recentlyVisited = recentlyVisited.slice(0, 11);
  setStorage("options:recentlyVisited", JSON.stringify(recentlyVisited));
} else {
  resetRecentlyVisited();
}

checkRecentlyVisited();

declare global {
  interface StorageItems {
    /** A JSON list of the last 11 pages the user visited. */
    "options:recentlyVisited"?: string;

    /** Whether the user has installed the app. */
    "pwa:isInstalled"?: "true" | "false";

    /** The time of the last install. */
    "pwa:lastInstallTime"?: string;
  }
}

navigator.serviceWorker.register("/worker.js").catch(() => {});

document.title = `${document.title} - zSnout`;
let { get: getTitle, set: setTitle } = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Object.getPrototypeOf(document)),
  "title"
)!;
Object.defineProperty(document, "title", {
  enumerable: true,
  configurable: true,
  get() {
    return getTitle!.call(document).slice(0, -9);
  },
  set(title: string) {
    $("#nav name").text(title);
    setTitle!.call(document, `${title} - zSnout`);
  },
});
