import $ from "./jsx.js";
import { createNotification } from "./notification.js";

/** Checks the current theme set in `localStorage` and updates the page accordingly. */
export function checkTheme() {
  $.root.removeClass("light", "dark", "native");

  if (localStorage.theme == "light") $.root.addClass("light");
  else if (localStorage.theme == "dark") $.root.addClass("dark");
  else if (localStorage.theme == "native") $.root.addClass("native");
  else (localStorage.theme = "dark"), $.root.addClass("dark");
}

checkTheme();

window.addEventListener(
  "storage",
  (event) => event.key == "theme" && checkTheme()
);

declare global {
  interface Storage {
    /** The user's selected theme. When omitted, use the native theme. */
    theme?: "light" | "dark" | "native";
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

declare global {
  interface Storage {
    /** Whether the user has installed the app. */
    didInstall?: "true" | "false";

    /** The time of the last install. */
    lastInstallTime?: string;
  }
}
