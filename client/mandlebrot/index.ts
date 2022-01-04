import $ from "../assets/js/jsx.js";

let context = ($("#canvas")[0] as HTMLCanvasElement).getContext("2d")!;
let maxIterations = 150;

let xStart = -1.5;
let xEnd = 0.5;
let yStart = -1;
let yEnd = 1;

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

/** Redraws the Mandlebrot set. */
async function drawMandlebrot() {
  let cxs = Array.from({ length: 680 }, (e, i) => i).sort(
    () => Math.random() - 0.5
  );

  let c = 0;

  for (let i of cxs) {
    c++;
    for (let j = 0; j < 680; j++) {
      let cx = xStart + ((xEnd - xStart) * i) / 680;
      let cy = yStart + ((yEnd - yStart) * j) / 680;

      let iter = iterUntilUnbounded(cx, cy);
      let frac = 1 - iter / maxIterations;
      context.fillStyle = `rgb(${255 * frac}, ${255 * frac}, ${255 * frac})`;
      context.fillRect(i, j, 1, 1);
    }

    if (c % 10 == 0) await new Promise((resolve) => setTimeout(resolve, 0));
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

drawMandlebrot();

$("#canvas").on("click", ({ target, clientX, clientY }) => {
  let { left, top, height, width } = target.getBoundingClientRect();
  let x = clientX - left;
  let y = clientY - top;
  let cx = xStart + ((xEnd - xStart) * x) / width;
  let cy = yStart + ((yEnd - yStart) * y) / height;

  zoomIn(cx, cy);
  drawMandlebrot();
});
