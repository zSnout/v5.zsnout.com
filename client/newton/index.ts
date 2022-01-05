// I am aware that "Newton's Fractal" is really a set of fractals.
// I am also aware that "Newton's Fractal" is not the real name for this phenomenon.
// To simplify things, we only plot one fractal.

import {
  add,
  angle,
  Complex,
  cube,
  div,
  mult,
  sqr,
  sub,
} from "../assets/js/complex.js";
import $ from "../assets/js/jsx.js";
import { getLocationHash, setLocationHash } from "../assets/js/util.js";

let canvas = $("#canvas")[0] as HTMLCanvasElement;
let context = canvas.getContext("2d")!;
let canvasSize: 340 | 680 | 1360 | 2720 = 680;
let maxIterations = 20;
canvas.width = canvasSize;
canvas.height = canvasSize;

let xStart = -1;
let xEnd = 1;
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

function finalIteration(z: Complex): Complex {
  for (let i = 0; i < maxIterations; i++) {
    z = sub(z, div(add([-1, 0], cube(z)), mult([3, 0], sqr(z))));
  }

  return z;
}

function colorOfRootNearest(z: Complex) {
  let final = finalIteration(z);
  return `hsl(${(360 * angle(final)) / Math.PI}, 100%, 50%)`;
}

let drawID = 0;

/** Redraws a fractal using Newton's Method. */
async function drawNewtonsFractal() {
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

      let color = colorOfRootNearest([cx, cy]);
      context.fillStyle = color;
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
drawNewtonsFractal();

$("#canvas").on("click", ({ target, clientX, clientY, shiftKey }) => {
  let { left, top, height, width } = target.getBoundingClientRect();
  let x = clientX - left;
  let y = clientY - top;
  let cx = xStart + ((xEnd - xStart) * x) / width;
  let cy = yStart + ((yEnd - yStart) * y) / height;

  if (shiftKey) zoomOut(cx, cy);
  else zoomIn(cx, cy);
  setPageHash();
  drawNewtonsFractal();
});

$("#icon-blur").on("click", () => {
  if (maxIterations <= 10) maxIterations = 5;
  else maxIterations -= 10;

  setPageHash();
  drawNewtonsFractal();
});

$("#icon-focus").on("click", () => {
  if (maxIterations < 10) maxIterations = 10;
  else maxIterations += 10;

  setPageHash();
  drawNewtonsFractal();
});

$("#icon-resolution").on("click", () => {
  if (canvasSize == 340) canvasSize = 680;
  else if (canvasSize == 680) canvasSize = 1360;
  else if (canvasSize == 1360) canvasSize = 2720;
  else canvasSize = 340;
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  setPageHash();
  drawNewtonsFractal();
});

$("#icon-zoomin").on("click", () => {
  zoomIn((xStart + xEnd) / 2, (yStart + yEnd) / 2);
  setPageHash();
  drawNewtonsFractal();
});

$("#icon-zoomout").on("click", () => {
  zoomOut((xStart + xEnd) / 2, (yStart + yEnd) / 2);
  setPageHash();
  drawNewtonsFractal();
});
