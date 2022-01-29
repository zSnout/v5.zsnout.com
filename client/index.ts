import fetch from "./assets/js/fetch.js";
import $ from "./assets/js/jsx.js";
import { getStorage, setStorage } from "./assets/js/util.js";

/**
 * Sets the theme of the page and calls `checkTheme`.
 * @param theme The theme to set `localStorage` to.
 */
function setTheme(theme: StorageItems["options:theme"]) {
  setStorage("options:theme", theme);
}

$("#theme-aqua").on("click", () => setTheme("aqua"));
$("#theme-light").on("click", () => setTheme("light"));
$("#theme-dark").on("click", () => setTheme("dark"));
$("#theme-yellow-pink").on("click", () => setTheme("yellow-pink"));

let auth = getStorage("auth");

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

      $('[href="/account/login/"]')
        .text("Log Out")
        .attr("href", "")
        .on("click", () => {
          setStorage("auth", undefined);
          location.reload();
        });
    }
  });

$("#clear-cache").on(
  "click",
  async () =>
    confirm(
      "Are you sure you want to clear the cache? This will remove offline capabilities of any pages you have visited. To re-enable offline mode, simply visit a page."
    ) && (await caches.keys()).map(caches.delete.bind(caches))
);
