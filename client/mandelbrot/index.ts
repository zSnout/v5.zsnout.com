import { createMandelbrotLike } from "../assets/js/fractal.js";

createMandelbrotLike(
  ([zx, zy], [cx, cy]) => [zx * zx - zy * zy + cx, 2 * zx * zy + cy],
  {
    title: "Mandelbrot Set",
    xStart: -1.5,
    xEnd: 0.5,
    yStart: -1,
    yEnd: 1,
    maxIterations: 150,
    canvasSize: 680,
  }
);
