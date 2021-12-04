import $ from "./jsx.js";

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

export {};
