import createFractal from "../assets/js/fractal.js";

createFractal(
  ({ x, y, maxIterations }) => {
    let zx = 0;
    let zy = 0;
    let iter = 0;

    do {
      zx = Math.abs(zx);
      zy = Math.abs(zy);

      let [px, py] = [zx * zx - zy * zy, 2 * zx * zy];
      [zx, zy] = [px + x, py + y];
      iter += 1;
    } while (Math.pow(zx, 2) + Math.pow(zy, 2) <= 4 && iter < maxIterations);

    let frac = 1 - iter / maxIterations;
    if (frac) return `hsl(${360 * ((frac * 2) % 1)}, 100%, 50%)`;
    else return "black";
  },
  {
    title: "Burning Ship",
    xStart: -2,
    xEnd: 1,
    yStart: -2,
    yEnd: 1,
    maxIterations: 100,
    canvasSize: 680,
  }
);
