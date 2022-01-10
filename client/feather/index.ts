import { add, cube, div } from "../assets/js/complex.js";
import { createMandelbrotLike } from "../assets/js/fractal.js";

createMandelbrotLike(
  ([zx, zy], c) => {
    return add(div(cube([zx, zy]), add([1, 0], [zx * zx, zy * zy])), c);
  },
  {
    title: "Feather Fractal",
    xStart: -2,
    xEnd: 2,
    yStart: -2,
    yEnd: 2,
    maxIterations: 100,
    canvasSize: 680,
  }
);
