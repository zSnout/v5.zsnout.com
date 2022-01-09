import $ from "../assets/js/jsx.js";
import { getLocationHash, setLocationHash } from "../assets/js/util.js";

let canvas = $("#canvas")[0] as HTMLCanvasElement;
let context = canvas.getContext("2d")!;
let canvasSize: 170 | 340 = 340;
let blobEndChance = 0.8;
canvas.width = canvasSize;
canvas.height = canvasSize;

try {
  let json = JSON.parse(getLocationHash());

  if (typeof json == "object" && json != null) {
    blobEndChance = json.blobEndChance ?? blobEndChance;
    canvasSize = json.canvasSize || canvasSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
  }
} catch {}

/** Sets the page hash to match the current settings. */
function setPageHash() {
  setLocationHash(JSON.stringify({ blobEndChance, canvasSize }));
}

/** A list of coordinates that have been visited. */
let coords = new Set<string>();

/**
 * Draws a blob.
 * @param x The x coordinate of the center of the blob.
 * @param y The y coordinate of the center of the blob.
 */
function drawBlob(x: number, y: number) {
  coords.add(`${x},${y}`);
  context.fillRect(x, y, 1, 1);

  if (Math.random() < blobEndChance) return;

  if (!coords.has(`${x - 1},${y}`) && x - 1 > 0) drawBlob(x - 1, y);
  if (!coords.has(`${x + 1},${y}`) && x + 1 < canvasSize) drawBlob(x + 1, y);
  if (!coords.has(`${x},${y - 1}`) && y - 1 > 0) drawBlob(x, y - 1);
  if (!coords.has(`${x},${y + 1}`) && y + 1 < canvasSize) drawBlob(x, y + 1);
}

/** Redraws the main canvas. */
function drawImage() {
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  drawBlob(canvasSize / 2, canvasSize / 2);
}

$("#canvas").on("click", drawImage);

$("#icon-smallblob").on("click", () => {
  if (blobEndChance >= 0.95) blobEndChance = 1;
  else blobEndChance += 0.05;

  setPageHash();
  drawImage();
});

$("#icon-bigblob").on("click", () => {
  if (blobEndChance <= 0.05) blobEndChance = 0;
  else blobEndChance -= 0.05;

  setPageHash();
  drawImage();
});

$("#icon-resolution").on("click", () => {
  if (canvasSize == 340) canvasSize = 170;
  else canvasSize = 340;
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  setPageHash();
  drawImage();
});

drawImage();

$("#canvas").autoResize();
