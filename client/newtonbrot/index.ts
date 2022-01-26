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
  (c, { maxIterations }) => {
    let z: Complex = [0, 0];
    let sc = sub(c, [1, 0]);
    for (let i = 0; i < maxIterations; i++) {
      let result = sub(add(cube(z), mult(sc, z)), c);
      let deriv = add(mult([3, 0], sqr(z)), sc);

      z = sub(z, div(result, deriv));
    }

    return `hsl(${(360 * angle(z)) / Math.PI}, 100%, 50%)`;
  },
  {
    title: "Newtonbrot",
    xStart: -2,
    xEnd: 2,
    yStart: -2,
    yEnd: 2,
    maxIterations: 10,
  }
);
