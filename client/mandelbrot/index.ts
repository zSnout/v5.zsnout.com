import { createMandelbrotLike } from "../assets/js/fractal.js";

createMandelbrotLike(
  ([zx, zy], [cx, cy]) => [zx * zx - zy * zy + cx, 2 * zx * zy + cy],
  {
    title: "Mandelbrot Set",
    xStart: -2,
    xEnd: 1,
    yStart: -1.5,
    yEnd: 1.5,
    maxIterations: 150,
    canvasSize: 680,
  }
);
