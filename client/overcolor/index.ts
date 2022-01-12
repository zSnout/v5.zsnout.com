import "https://unpkg.com/pngjs@6.0.0/browser.js";
import type { PNG as PNGInst } from "pngjs";
import $ from "../assets/js/jsx.js";
import {
  downloadPNG,
  imageToPNG,
  overcolorify,
  pngToFile,
} from "../assets/js/png.js";

let upload = $("#upload")[0] as HTMLInputElement;
let output = $("#output")[0] as HTMLImageElement;

let png: PNGInst;

$("#icon-upload").on("click", () => $(upload).click());
$(upload).on("input", async () => {
  let files = upload.files;
  if (!files) return;

  let file = files[0];
  if (!file) return;

  png = await imageToPNG(file);
  overcolorify(png);

  $.main.addClass("hasimage");
  output.src = URL.createObjectURL(pngToFile(png));
});

$("#icon-download").on(
  "click",
  () => png && downloadPNG(png, "overcolorified.png")
);
