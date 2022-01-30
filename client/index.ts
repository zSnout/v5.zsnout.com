import fetch from "./assets/js/fetch.js";
import $ from "./assets/js/jsx.js";
import { getStorage, onStorageChange, setStorage } from "./assets/js/util.js";

/**
 * Sets the theme of the page and calls `checkTheme`.
 * @param theme The theme to set `localStorage` to.
 */
function setTheme(theme: StorageItems["options:theme"]) {
  setStorage("options:theme", theme);
}

$('[href="#theme-aqua"]')
  .attr("href", "")
  .on("click", (e) => (e.preventDefault(), setTheme("aqua")));

$('[href="#theme-light"]')
  .attr("href", "")
  .on("click", (e) => (e.preventDefault(), setTheme("light")));

$('[href="#theme-dark"]')
  .attr("href", "")
  .on("click", (e) => (e.preventDefault(), setTheme("dark")));

$('[href="#theme-yellow-pink"]')
  .attr("href", "")
  .on("click", (e) => (e.preventDefault(), setTheme("yellow-pink")));

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

$('[href="#clear-cache"')
  .attr("href", "")
  .on(
    "click",
    async (e) => (
      e.preventDefault(),
      confirm(
        "Are you sure you want to clear the cache? This will remove offline capabilities of any pages you have visited. To re-enable offline mode, simply visit a page."
      ) && (await caches.keys()).map(caches.delete.bind(caches))
    )
  );

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
