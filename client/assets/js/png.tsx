import "https://unpkg.com/pngjs@6.0.0/browser.js";
import type { PNG as PNGInst } from "pngjs";
import { hslToRgb, rgbToHsl } from "./color.js";
import $, { jsx } from "./jsx.js";

/** The main PNG class. */
let PNG = png.PNG;

/**
 * Parses the contents of a Blob as a PNG.
 * @param blob The blob to read from.
 * @returns A parsed PNG.
 */
export function fileToPNG(blob: Blob) {
  return new Promise<PNGInst>((resolve) => {
    let reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onload = () => {
      let result = reader.result;
      if (result instanceof ArrayBuffer) {
        let png = new PNG();
        png.parse(new Uint8Array(result) as Buffer);
        png.on("parsed", () => resolve(png));
      }
    };
  });
}

/**
 * Packs a PNG into a blob.
 * @param png The PNG to convert.
 * @returns A Blob containing the PNG.
 */
export function pngToFile(png: PNGInst) {
  return new Blob([PNG.sync.write(png)], { type: "image/png" });
}

/**
 * Downloads a PNG.
 * @param png The PNG to download.
 * @param name The name to give the file.
 */
export function downloadPNG(png: PNGInst, name: string = "image.png") {
  let blob = pngToFile(png);
  let url = URL.createObjectURL(blob);
  let a = <a href={url} download={name} style={{ display: "none" }}></a>;
  $.body.append(a);
  a.click();
}

/**
 * Converts an arbitrary image to a PNG.
 * @param image The image to convert.
 * @returns A promise resolving to a PNG.
 */
export function imageToPNG(image: Blob) {
  return new Promise<PNGInst>((resolve) => {
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = () => {
      let result = reader.result;
      if (typeof result == "string") {
        let image = new Image();
        image.onload = () => {
          let canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;

          let context = canvas.getContext("2d")!;
          context.drawImage(image, 0, 0);

          canvas.toBlob((blob) => resolve(fileToPNG(blob!)), "image/png", 1);
        };
        image.src = result;
      }
    };
  });
}

/**
 * Removes all saturation and lightness from a PNG.
 * @param png The PNG to overcolor.
 * @returns The modified PNG.
 */
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

  return png;
}

/**
 * Converts a video to a PNG.
 * @param video The element containing the video.
 * @returns A promise resolving to a PNG.
 */
export function videoToPNG(video: HTMLVideoElement) {
  return new Promise<PNGInst>((resolve) => {
    let canvas = (<canvas />)[0] as HTMLCanvasElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let context = canvas.getContext("2d")!;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => resolve(fileToPNG(blob!)), "image/png", 1);
  });
}
