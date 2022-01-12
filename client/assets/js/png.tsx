import "https://unpkg.com/pngjs@6.0.0/browser.js";
import type { PNG as PNGInst } from "pngjs";
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
    reader.onload = (e) => {
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
  a.render();
}
