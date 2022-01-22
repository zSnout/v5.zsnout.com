import { createMandelbrotLike } from "../assets/js/fractal.js";

createMandelbrotLike(
  ([zx, zy], [cx, cy]) => {
    zx = Math.abs(zx);
    zy = Math.abs(zy);

    return [zx * zx - zy * zy + cx, 2 * zx * zy + cy];
  },
  {
    title: "Burning Ship",
    xStart: -2,
    xEnd: 1,
    yStart: -2,
    yEnd: 1,
    maxIterations: 100,
  }
);
