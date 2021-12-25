import fetch from "./assets/js/fetch.js";
import $ from "./assets/js/jsx.js";
import { getStorage, setStorage } from "./assets/js/util.js";

/**
 * Sets the theme of the page and calls `checkTheme`.
 * @param theme The theme to set `localStorage` to.
 */
function setTheme(theme: StorageItems["theme"]) {
  setStorage("theme", theme);
}

$("#theme-aqua").on("click", () => setTheme("aqua"));
$("#theme-light").on("click", () => setTheme("light"));
$("#theme-dark").on("click", () => setTheme("dark"));
$("#theme-yellow-pink").on("click", () => setTheme("yellow-pink"));

let auth = getStorage("auth");

if (auth)
  fetch(
    "/account/userdata/",
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
