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
import createFractal from "../assets/js/fractal.js";

createFractal(
  ({ x, y, maxIterations }) => {
    let z: Complex = [x, y];
    for (let i = 0; i < maxIterations; i++) {
      z = sub(z, div(add([-1, 0], cube(z)), mult([3, 0], sqr(z))));
    }

    return `hsl(${(360 * angle(z)) / Math.PI}, 100%, 50%)`;
  },
  {
    title: "Newton's Fractal",
    xStart: -3,
    xEnd: 3,
    yStart: -3,
    yEnd: 3,
    maxIterations: 10,
  }
);
