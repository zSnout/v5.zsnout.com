import $, { jsx } from "./jsx.js";
import { createNotification } from "./notification.js";
import { getStorage, setStorage } from "./util.js";

/** Checks the current theme set in `localStorage` and updates the page accordingly. */
export function checkTheme() {
  $.root[0].classList.forEach((className) => {
    if (className.startsWith("theme-")) $.root[0].classList.remove(className);
  });

  $.root.addClass(`theme-${getStorage("theme") || "aqua"}`);
}

/** Gets all pages in the "Recently Visited" list. */
export function getRecentlyVisited(): { href: string; title: string }[] | null {
  let recentlyVisited = getStorage("recentlyVisited");
  if (!recentlyVisited) return null;

  try {
    let lastVisited;
    try {
      lastVisited = JSON.parse(recentlyVisited);
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
      "recentlyVisited",
      JSON.stringify([
        {
          href: location.pathname,
          title: document.title,
        },
      ])
    );
  else setStorage("recentlyVisited", "[]");
}

checkTheme();

if (new URL(location.href).searchParams.has("embed")) $.root.addClass("embed");

window.addEventListener("storage", (event) => {
  if (event.key == "theme") checkTheme();
  if (event.key == "recentlyVisited") checkRecentlyVisited();
});

let hasPrompted = false;
let didInstall = getStorage("didInstall");
if (
  !didInstall ||
  (didInstall == "false" &&
    +getStorage("lastInstallTime")! < Date.now() - 1000 * 60 * 60 * 24 * 7)
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

          if (outcome == "dismissed") setStorage("didInstall", "false");
          else setStorage("didInstall", "true");

          setStorage("lastInstallTime", "" + Date.now());
        },
        async Cancel() {
          hide();

          setStorage("didInstall", "false");
          setStorage("lastInstallTime", "" + Date.now());
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
  setStorage("recentlyVisited", JSON.stringify(recentlyVisited));
} else {
  resetRecentlyVisited();
}

checkRecentlyVisited();

declare global {
  interface StorageItems {
    /** The user's selected theme. When omitted, use the native theme. */
    theme?: "light" | "aqua" | "dark" | "yellow-pink";

    /** Whether the user has installed the app. */
    didInstall?: "true" | "false";

    /** The time of the last install. */
    lastInstallTime?: string;

    /** A JSON list of the last 11 pages the user visited. */
    recentlyVisited?: string;
  }
}

navigator.serviceWorker.register("/worker.js").catch(() => {});
