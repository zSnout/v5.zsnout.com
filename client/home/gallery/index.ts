import $ from "../../assets/js/jsx.js";
import {
  getStorage,
  onStorageChange,
  setStorage,
} from "../../assets/js/util.js";

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
