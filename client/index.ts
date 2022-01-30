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

$('[href="#theme-aqua"]')
  .attr("href", "")
  .on("click", () => setTheme("aqua"));

$('[href="#theme-light"]')
  .attr("href", "")
  .on("click", () => setTheme("light"));

$('[href="#theme-dark"]')
  .attr("href", "")
  .on("click", () => setTheme("dark"));

$('[href="#theme-yellow-pink"]')
  .attr("href", "")
  .on("click", () => setTheme("yellow-pink"));

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
    async () =>
      confirm(
        "Are you sure you want to clear the cache? This will remove offline capabilities of any pages you have visited. To re-enable offline mode, simply visit a page."
      ) && (await caches.keys()).map(caches.delete.bind(caches))
  );
