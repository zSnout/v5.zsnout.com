import fetch from "../assets/js/fetch.js";
import { checkTheme } from "../assets/js/index.js";
import $ from "../assets/js/jsx.js";

/**
 * Sets the theme of the page and calls `checkTheme`.
 * @param theme The theme to set `localStorage` to.
 */
function setTheme(theme: typeof localStorage.theme) {
  localStorage.theme = theme;
  checkTheme();
}

$("#theme-native").on("click", () => setTheme(undefined));
$("#theme-light").on("click", () => setTheme("light"));
$("#theme-dark").on("click", () => setTheme("dark"));

if (localStorage.auth)
  fetch(
    "/account/userdata/",
    "POST",
    { error: "boolean", username: "string" },
    { session: localStorage.auth }
  ).then((result) => {
    if (result.ok) {
      $("#welcome-to-zsnout").text(
        `Welcome to zSnout, @${result.data.username}!`
      );

      $("#login")
        .text("Log Out")
        .attr("href", "")
        .on("click", () => {
          delete localStorage.auth;
          location.reload();
        });
    }
  });
