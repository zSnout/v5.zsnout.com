import "https://unpkg.com/pngjs@6.0.0/browser.js";
import type { PNG as PNGInst } from "pngjs";
import $ from "../assets/js/jsx.js";
import {
  colorBlind,
  downloadPNG,
  imageToPNG,
  pngToFile,
} from "../assets/js/png.js";
import { randint } from "../assets/js/util.js";

let upload = $("#upload")[0] as HTMLInputElement;
let output = $("#output")[0] as HTMLImageElement;

/** A number representing the color to blind. */
let blindType = randint(1, 3) as 1 | 2 | 3;

/** Whether to blind a single color. */
let blindOne = !!randint();

document.title = blindOne
  ? `Unsee ${
      blindType == 1
        ? "Green & Blue"
        : blindType == 2
        ? "Red & Blue"
        : "Red & Green"
    }`
  : `Unsee ${blindType == 1 ? "Red" : blindType == 2 ? "Green" : "Blue"}`;

let png: PNGInst;

$("#icon-upload").on("click", () => $(upload).click());
$(upload).on("input", async () => {
  let files = upload.files;
  if (!files) return;

  let file = files[0];
  if (!file) return;

  png = await imageToPNG(file);
  colorBlind(
    png,
    blindOne ? blindType != 1 : blindType == 1,
    blindOne ? blindType != 2 : blindType == 2,
    blindOne ? blindType != 3 : blindType == 3
  );

  $.main.addClass("hasimage");
  output.src = URL.createObjectURL(pngToFile(png));
});

$("#icon-download").on(
  "click",
  () => png && downloadPNG(png, "overcolorified.png")
);
