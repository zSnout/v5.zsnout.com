import $ from "../assets/js/jsx.js";
import {
  getLocationHash,
  setLocationHash,
  shuffle,
} from "../assets/js/util.js";

let canvas = $("#canvas")[0] as HTMLCanvasElement;
let context = canvas.getContext("2d")!;
let canvasSize = 2;
let noiseChance = 0.75;
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
  let cxs = shuffle(Array.from({ length: canvas.width }, (_, i) => i));
  let c = 0;

  for (let i of cxs) {
    c++;
    for (let j = 0; j < canvas.height; j++) {
      let hue = (360 * (i + j)) / (canvas.width + canvas.height);
      if (Math.random() < noiseChance / 2) hue = 360 - hue;
      else if (Math.random() + noiseChance / 2 < noiseChance)
        hue = 360 * Math.random();

      context.fillStyle = `hsl(${hue}, 100%, 50%)`;
      context.fillRect(i, j, 1, 1);
    }

    if (c % 10 == 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (drawID != myID) return;
    }
  }
}

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
  canvasSize *= 2;
  if (canvasSize >= 8) canvasSize = 1;

  onResize();
  setPageHash();
  drawImage();
});

function onResize() {
  $.main.empty();
  canvas.width = ($.main.width() * canvasSize) / 2;
  canvas.height = ($.main.height() * canvasSize) / 2;
  $.main.append(canvas);
}

window.addEventListener("resize", onResize);
onResize();
drawImage();
$("#canvas").on("click", drawImage);
