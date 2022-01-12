import "https://unpkg.com/pngjs@6.0.0/browser.js";
import type { PNG as PNGInst } from "pngjs";
import { hslToRgb, rgbToHsl } from "../assets/js/color.js";
import $ from "../assets/js/jsx.js";
import { downloadPNG, imageToPNG, pngToFile } from "../assets/js/png.js";

let upload = $("#upload")[0] as HTMLInputElement;
let output = $("#output")[0] as HTMLImageElement;

export function overcolorify(png: PNGInst) {
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      let idx = (png.width * y + x) << 2;

      let [r, g, b] = [png.data[idx], png.data[idx + 1], png.data[idx + 2]];
      let [h, s, l] = rgbToHsl(r, g, b);
      let [r2, g2, b2] = hslToRgb(h, 1, 0.5);

      if (Math.max(r, g, b) - Math.min(r, g, b) < 8) {
        let avg = (r + g + b) / 3;
        r2 = g2 = b2 = avg;
      }

      png.data[idx] = r2;
      png.data[idx + 1] = g2;
      png.data[idx + 2] = b2;
    }
  }
}

let png: PNGInst;

$("#icon-upload").on("click", () => $(upload).click());
$(upload).on("input", async () => {
  let files = upload.files;
  if (!files) return;

  let file = files[0];
  if (!file) return;

  png = await imageToPNG(file);
  overcolorify(png);

  output.src = URL.createObjectURL(pngToFile(png));
});

$("#icon-download").on(
  "click",
  () => png && downloadPNG(png, "overcolorified.png")
);
