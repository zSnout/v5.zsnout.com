import { add, angle, cube, div, mult, sqr, sub } from "../assets/js/complex.js";
import createFractal from "../assets/js/fractal.js";

createFractal(
  (z, { maxIterations }) => {
    for (let i = 0; i < maxIterations; i++) {
      let z2 = sqr(z);
      let z3 = cube(z);
      let result = add(
        add(add([-100, 0], mult(z3, z2)), mult(z3, [Math.PI, 0.5])),
        z2
      );
      let deriv = add(
        add(mult([5, 0], sqr(z2)), mult([3, 0], mult([Math.PI, 0.5], z2))),
        mult([2, 0], z)
      );

      z = sub(z, div(result, deriv));
    }

    return `hsl(${(360 * angle(z)) / Math.PI}, 100%, 50%)`;
  },
  {
    title: "Newton's Fractal (2)",
    xStart: -4,
    xEnd: 4,
    yStart: -4,
    yEnd: 4,
    maxIterations: 10,
  }
);
