import { abs2, add, Complex, cube, div, mult } from "../assets/js/complex.js";
import createFractal from "../assets/js/fractal.js";

/** The type of a variable in an equation. */
type Variable = Complex | "z" | "a" | "b" | "c";

createFractal<Variable[][]>(
  ([cx, cy], { parsedEq, maxIterations }) => {
    if (!parsedEq) return "white";
    let zx = 0;
    let zy = 0;
    let iter = 0;

    do {
      [zx, zy] = parsedEq
        .map<Complex>((vars) =>
          vars
            .map<Complex>((e) =>
              e == "z"
                ? [zx, zy]
                : e == "c"
                ? [cx, cy]
                : e == "a"
                ? [cx, 0]
                : e == "b"
                ? [0, cy]
                : e
            )
            .reduce<Complex>((acc, n) => mult(acc, n), [1, 0])
        )
        .reduce<Complex>((acc, n) => add(acc, n), [0, 0]);
      iter++;
    } while (zx * zx + zy * zy <= 4 && iter < maxIterations);

    let frac = 1 - iter / maxIterations;
    if (frac) return `hsl(${360 * ((frac * 2) % 1)}, 100%, 50%)`;
    else return "black";
  },
  {
    title: "Custom Fractal ({EQ})",
    xStart: -2,
    xEnd: 2,
    yStart: -2,
    yEnd: 2,
    maxIterations: 50,
    eq: "zz+c",
    saveEq: true,
    eqParser(eq) {
      // The equation parser is incredibly simple.
      // It allows you to write equations like zz + c.
      // It gives you the variables `z` (the current result), `c` (the constant),
      // a` (the real part of `z`), `b` (the imaginary part of `z`),
      // `m` (-1), `p` (1), `i` (square root of -1), `d` (-i).

      return eq
        .trim()
        .split(/\s*\+\s*/g)
        .map((e) =>
          e
            .split("")
            .map((e): Variable | undefined => {
              switch (e) {
                case "z":
                case "a":
                case "b":
                case "c":
                  return e;

                case "i":
                  return [0, 1] as Complex;

                case "d":
                  return [0, -1] as Complex;

                case "m":
                  return [-1, 0] as Complex;

                case "p":
                  return [1, 0] as Complex;
              }
            })
            .filter((e): e is Variable => !!e)
        );
    },
  }
);
