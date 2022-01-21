import $ from "../assets/js/jsx.js";
import { getLocationHash, setLocationHash } from "../assets/js/util.js";

let canvas = $("#canvas")[0] as HTMLCanvasElement;
let context = canvas.getContext("2d")!;
let canvasSize = 1000;
canvas.width = canvasSize;

try {
  let size = +getLocationHash();

  if (Number.isFinite(size) && size >= 5) {
    canvasSize = size;
    canvas.width = canvasSize;
  }
} catch {}

/** Sets the page hash to match the current settings. */
function setPageHash() {
  setLocationHash("" + canvasSize);
}

/** Redraws the main canvas. */
function drawImage() {
  for (let i = 0; i < canvasSize; i++) {
    context.fillStyle = Math.random() < i / canvasSize ? "black" : "white";
    context.fillRect(i, 0, 1, 1);
  }
}

drawImage();
$("#canvas").on("click", drawImage);

$("#icon-shrink").on("click", () => {
  if (canvasSize <= 5) canvasSize = 5;
  else if (canvasSize >= 200) canvasSize -= 100;
  else if (canvasSize >= 100) canvasSize -= 50;
  else if (canvasSize >= 50) canvasSize -= 25;
  else if (canvasSize >= 25) canvasSize -= 5;

  canvas.width = canvasSize;
  setPageHash();
  drawImage();
});

$("#icon-enlarge").on("click", () => {
  if (canvasSize >= 100) canvasSize += 100;
  else if (canvasSize >= 50) canvasSize += 50;
  else if (canvasSize >= 25) canvasSize += 25;
  else if (canvasSize >= 5) canvasSize += 5;
  else canvasSize = 5;

  canvas.width = canvasSize;
  setPageHash();
  drawImage();
});

$("#canvas").autoResize();
