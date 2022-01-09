import { add, cube, div } from "../assets/js/complex.js";
import createFractal from "../assets/js/fractal.js";

createFractal(
  ({ x, y, maxIterations }) => {
    let zx = 0;
    let zy = 0;
    let iter = 0;

    do {
      [zx, zy] = div(cube([zx, zy]), add([1, 0], [zx * zx, zy * zy]));
      [zx, zy] = [zx + x, zy + y];

      iter += 1;
    } while (Math.pow(zx, 2) + Math.pow(zy, 2) <= 4 && iter < maxIterations);

    let frac = 1 - iter / maxIterations;
    if (frac) return `hsl(${360 * ((frac * 2) % 1)}, 100%, 50%)`;
    else return "black";
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
