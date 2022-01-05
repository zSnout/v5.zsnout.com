import $ from "../assets/js/jsx.js";
import { getLocationHash, setLocationHash } from "../assets/js/util.js";

let canvas = $("#canvas")[0] as HTMLCanvasElement;
let context = canvas.getContext("2d")!;
let canvasSize: 340 | 680 | 1360 | 2720 = 680;
let maxIterations = 150;
canvas.width = canvasSize;
canvas.height = canvasSize;

let xStart = -1.5;
let xEnd = 0.5;
let yStart = -1;
let yEnd = 1;

try {
  let json = JSON.parse(getLocationHash());

  if (typeof json == "object" && json != null) {
    xStart = json.xStart || xStart;
    xEnd = json.xEnd || xEnd;
    yStart = json.yStart || yStart;
    yEnd = json.yEnd || yEnd;
    maxIterations = json.maxIterations || maxIterations;
    canvasSize = json.canvasSize || canvasSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
  }
} catch {}

/**
 * Returns the number of iterations until the point `z` is unbounded.
 * @param cx The real part of `c`.
 * @param cy The imagninary part of `c`.
 * @returns The number of iterations until `z` escapes the circle of radius 2.
 */
function iterUntilUnbounded(cx: number, cy: number) {
  let zx = 0;
  let zy = 0;
  let iter = 0;

  do {
    let [px, py] = [zx * zx - zy * zy, 2 * zx * zy];
    [zx, zy] = [px + cx, py + cy];
    iter += 1;
  } while (Math.pow(zx, 2) + Math.pow(zy, 2) <= 4 && iter < maxIterations);

  return iter;
}

let drawID = 0;

/** Redraws the Mandlebrot set. */
async function drawMandelbrot() {
  let myID = (drawID = Math.random());
  let cxs = Array.from({ length: canvasSize }, (e, i) => i).sort(
    () => Math.random() - 0.5
  );

  let c = 0;

  for (let i of cxs) {
    c++;
    for (let j = 0; j < canvasSize; j++) {
      let cx = xStart + ((xEnd - xStart) * i) / canvasSize;
      let cy = yStart + ((yEnd - yStart) * j) / canvasSize;

      let iter = iterUntilUnbounded(cx, cy);
      let frac = 1 - iter / maxIterations;
      if (frac) context.fillStyle = `hsl(${360 * ((frac * 2) % 1)}, 100%, 50%)`;
      else context.fillStyle = "black";
      context.fillRect(i, j, 1, 1);
    }

    if (c % 10 == 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (drawID != myID) return;
    }
  }
}

/**
 * Zooms in on a point in the Mandlebrot set with 2x zoom.
 * @param cx The real part of the point to zoom in on.
 * @param cy The imaginary part of the point to zoom in on.
 */
function zoomIn(cx: number, cy: number) {
  let xDelta = (xEnd - xStart) / 4;
  let yDelta = (yEnd - yStart) / 4;

  xStart = cx - xDelta;
  xEnd = cx + xDelta;
  yStart = cy - yDelta;
  yEnd = cy + yDelta;
}

/**
 * Zooms in on a point in the Mandlebrot set with 2x zoom.
 * @param cx The real part of the point to zoom in on.
 * @param cy The imaginary part of the point to zoom in on.
 */
function zoomOut(cx: number, cy: number) {
  let xDelta = xEnd - xStart;
  let yDelta = yEnd - yStart;

  xStart = cx - xDelta;
  xEnd = cx + xDelta;
  yStart = cy - yDelta;
  yEnd = cy + yDelta;
}

/** Sets the page hash to match the current settings. */
function setPageHash() {
  setLocationHash(
    JSON.stringify({ xStart, xEnd, yStart, yEnd, maxIterations, canvasSize })
  );
}

setPageHash();
drawMandelbrot();

$("#canvas").on("click", ({ target, clientX, clientY, shiftKey }) => {
  let { left, top, height, width } = target.getBoundingClientRect();
  let x = clientX - left;
  let y = clientY - top;
  let cx = xStart + ((xEnd - xStart) * x) / width;
  let cy = yStart + ((yEnd - yStart) * y) / height;

  if (shiftKey) zoomOut(cx, cy);
  else zoomIn(cx, cy);
  setPageHash();
  drawMandelbrot();
});

$("#icon-blur").on("click", () => {
  if (maxIterations <= 50) maxIterations = 25;
  else maxIterations -= 50;

  setPageHash();
  drawMandelbrot();
});

$("#icon-focus").on("click", () => {
  if (maxIterations < 50) maxIterations = 50;
  else maxIterations += 50;

  setPageHash();
  drawMandelbrot();
});

$("#icon-resolution").on("click", () => {
  if (canvasSize == 340) canvasSize = 680;
  else if (canvasSize == 680) canvasSize = 1360;
  else if (canvasSize == 1360) canvasSize = 2720;
  else canvasSize = 340;
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  setPageHash();
  drawMandelbrot();
});

$("#icon-zoomin").on("click", () => {
  zoomIn((xStart + xEnd) / 2, (yStart + yEnd) / 2);
  setPageHash();
  drawMandelbrot();
});

$("#icon-zoomout").on("click", () => {
  zoomOut((xStart + xEnd) / 2, (yStart + yEnd) / 2);
  setPageHash();
  drawMandelbrot();
});
