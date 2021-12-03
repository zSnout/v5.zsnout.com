import $ from "./jsx.js";

if (localStorage.theme == "light") $.root.addClass("light");
if (localStorage.theme == "dark") $.root.addClass("dark");

/** Checks the current theme set in `localStorage` and updates the page accordingly. */
export function checkTheme() {
  $.root.removeClass("light").removeClass("dark");
  if (localStorage.theme == "light") $.root.addClass("light");
  if (localStorage.theme == "dark") $.root.addClass("dark");
}

window.addEventListener(
  "storage",
  (event) => event.key == "theme" && checkTheme()
);

declare global {
  interface Storage {
    /** The user's selected theme. When omitted, use the native theme. */
    theme?: "light" | "dark";
  }
}

export {};
