import $ from "../assets/js/jsx.js";
import {
  getLocationHash,
  setLocationHash,
  shuffle,
} from "../assets/js/util.js";

let canvas = $("#canvas")[0] as HTMLCanvasElement;
let context = canvas.getContext("2d")!;
let canvasSize: 340 | 680 | 1360 | 2720 = 1360;
let noiseChance = 0.5;
canvas.width = canvasSize;
canvas.height = canvasSize;

try {
  let json = JSON.parse(getLocationHash());

  if (typeof json == "object" && json != null) {
    noiseChance = json.noiseChance ?? noiseChance;
    canvasSize = json.canvasSize || canvasSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
  }
} catch {}

/** Sets the page hash to match the current settings. */
function setPageHash() {
  setLocationHash(JSON.stringify({ noiseChance, canvasSize }));
}

let drawID = 0;

/** Redraws the main canvas. */
async function drawImage() {
  let myID = (drawID = Math.random());
  let cxs = shuffle(Array.from({ length: canvasSize }, (_, i) => i));
  let c = 0;

  for (let i of cxs) {
    c++;
    for (let j = 0; j < canvasSize; j++) {
      let hue = (360 * (i + j)) / 2 / canvasSize;
      if (Math.random() < noiseChance) hue = Math.random() * 360;

      context.fillStyle = `hsl(${hue}, 100%, 50%)`;
      context.fillRect(i, j, 1, 1);
    }

    if (c % 10 == 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (drawID != myID) return;
    }
  }
}

drawImage();
$("#canvas").on("click", drawImage);

$("#icon-blur").on("click", () => {
  if (noiseChance >= 0.95) noiseChance = 1;
  else noiseChance += 0.05;

  setPageHash();
  drawImage();
});

$("#icon-focus").on("click", () => {
  if (noiseChance <= 0.05) noiseChance = 0;
  else noiseChance -= 0.05;

  setPageHash();
  drawImage();
});

$("#icon-resolution").on("click", () => {
  if (canvasSize == 340) canvasSize = 680;
  else if (canvasSize == 680) canvasSize = 1360;
  else if (canvasSize == 1360) canvasSize = 2720;
  else canvasSize = 340;
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  setPageHash();
  drawImage();
});

$("#canvas").autoResize();
