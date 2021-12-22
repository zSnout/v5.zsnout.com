import $, { jsx } from "./jsx.js";
import { createNotification } from "./notification.js";

/** Checks the current theme set in `localStorage` and updates the page accordingly. */
export function checkTheme() {
  $.root[0].classList.forEach((className) => {
    if (className.startsWith("theme-")) $.root[0].classList.remove(className);
  });

  $.root.addClass(`theme-${localStorage.theme}`);
}

/** Gets all pages in the "Last Visited" list. */
export function getLastVisited(): { href: string; title: string }[] | null {
  if (!localStorage.lastVisited) return null;

  try {
    let lastVisited;
    try {
      lastVisited = JSON.parse(localStorage.lastVisited);
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

    return complete;
  } catch {
    return null;
  }
}

/** Checks the "Last Visited" page list and updates the footer accordingly. */
export function checkLastVisited() {
  if (!localStorage.lastVisited) return;

  try {
    let lastVisited = JSON.parse(localStorage.lastVisited);
    let footer = $("#last-visited").empty();

    if (Array.isArray(lastVisited))
      for (let { href, title } of lastVisited) {
        footer.append(<a href={href}>{title}</a>);
      }
  } catch {}
}

/** Reset the "Last Visited" list. */
function resetLastVisited() {
  localStorage.lastVisited = JSON.stringify([
    {
      href: location.pathname,
      title: document.title,
    },
  ]);
}

checkTheme();

if (new URL(location.href).searchParams.has("embed")) $.root.addClass("embed");

window.addEventListener("storage", (event) => {
  if (event.key == "theme") checkTheme();
  if (event.key == "lastVisited") checkLastVisited();
});

declare global {
  interface Storage {
    /** The user's selected theme. When omitted, use the native theme. */
    theme?: "light" | "aqua" | "dark" | "yellow-pink";
  }
}

let hasPrompted = false;
if (
  !localStorage.didInstall ||
  (localStorage.didInstall == "false" &&
    +localStorage.lastInstallTime! < Date.now() - 1000 * 60 * 60 * 24 * 7)
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

          if (outcome == "dismissed") localStorage.didInstall = "false";
          else localStorage.didInstall = "true";

          localStorage.lastInstallTime = Date.now().toString();
        },
        async Cancel() {
          hide();
          localStorage.didInstall = "false";
          localStorage.lastInstallTime = Date.now().toString();
        },
      }
    );
  });
}

let lastVisited = getLastVisited();
if (lastVisited) {
  lastVisited = lastVisited.filter(({ href }) => href != location.pathname);
  lastVisited.unshift({ href: location.pathname, title: document.title });
  localStorage.lastVisited = JSON.stringify(lastVisited);
} else {
  resetLastVisited();
}

checkLastVisited();

declare global {
  interface Storage {
    /** Whether the user has installed the app. */
    didInstall?: "true" | "false";

    /** The time of the last install. */
    lastInstallTime?: string;

    /** A JSON list of the last 10 pages the user visited. */
    lastVisited?: string;
  }
}
