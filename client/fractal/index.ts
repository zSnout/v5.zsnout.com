import { add, cube, div } from "../assets/js/complex.js";
import createFractal from "../assets/js/fractal.js";

createFractal(
  ({ x, y, seed, maxIterations }) => {
    let zx = 0;
    let zy = 0;
    let iter = 0;
    let type = Math.floor(seed * 4) as 0 | 1 | 2 | 3;
    seed = (seed * 4) % 1;

    do {
      if (type == 1 || type == 3) {
        zx = Math.abs(zx);
        zy = Math.abs(zy);
      }

      if (type == 1 || type == 2) {
        [zx, zy] = div(cube([zx, zy]), add([seed, -seed], [zx * zx, zy * zy]));
        [zx, zy] = [zx + x, zy + y];
      }

      if (type == 0 || type == 3) {
        [zx, zy] = div([zx, zy], add([seed, -seed], [zx * zx, zy * zy]));
        [zx, zy] = [zx + x, zy * y];
      }

      iter += 1;
    } while (Math.pow(zx, 2) + Math.pow(zy, 2) <= 4 && iter < maxIterations);

    let frac = 1 - iter / maxIterations;
    if (frac) return `hsl(${360 * ((frac * 2) % 1)}, 100%, 50%)`;
    else return "black";
  },
  {
    title: "Random Fractal",
    xStart: -2,
    xEnd: 2,
    yStart: -2,
    yEnd: 2,
    maxIterations: 100,
    canvasSize: 680,
    useSeed: true,
  }
);
