import { abs2, Complex } from "./complex.js";
import $ from "./jsx.js";
import { getLocationHash, setLocationHash, shuffle, wait } from "./util.js";

/** A list of options that can be passed to a fractal generator. */
export interface OptionList<Equation> {
  title?: string;
  xStart?: number;
  xEnd?: number;
  yStart?: number;
  yEnd?: number;
  maxIterations?: number;
  seed?: number;
  saveSeed?: boolean;
  eq?: string;
  saveEq?: boolean;
  eqParser?: (eq: string) => Equation;
}

/** Data passed to a {@linkcode FractalGenerator}. */
export interface GeneratorInformation<Equation> {
  seed: number;
  eq: string;
  parsedEq?: Equation;
  maxIterations: number;
}

/** The type of a fractal generator. */
export type FractalGenerator<Equation> = (
  position: Complex,
  data: GeneratorInformation<Equation>
) => string;

/**
 * Creates a fractal generator using the standard toolbar.
 * @param generator The fractal generator to use.
 * @param options A list of options to use.
 */
export default function createFractal<Equation>(
  generator: FractalGenerator<Equation>,
  { title = "Unnamed Fractal", ...options }: OptionList<Equation> = {}
) {
  let json: OptionList<Equation> = {};
  try {
    let parsed = JSON.parse(getLocationHash());
    if (typeof parsed == "object" && parsed !== null) json = parsed;
  } catch {}

  let canvas = $("#canvas")[0] as HTMLCanvasElement;
  let context = canvas.getContext("2d")!;

  let seed = json.seed ?? options.seed ?? Math.random();
  let eq = json.eq ?? options.eq ?? "z";
  let parsedEq = options.eqParser?.(eq) ?? undefined;
  let maxIterations = json.maxIterations ?? options.maxIterations ?? 100;
  let xStart = json.xStart ?? options.xStart ?? -1;
  let xEnd = json.xEnd ?? options.xEnd ?? 1;
  let yStart = json.yStart ?? options.yStart ?? -1;
  let yEnd = json.yEnd ?? options.yEnd ?? 1;

  /** The ID of the current drawing. */
  let drawID = 0;

  /**
   * Redraws the image at a specific resolution.
   * @param reso The resolution of the image.
   * @returns A promise resolving to a boolean indicating whether the fractal was drawn without being canceled.
   */
  async function redrawFractalAt(reso: number) {
    let { xStart, xEnd, yStart, yEnd } = computeEndpoints();
    console.log({ xStart, xEnd, yStart, yEnd });
    let myID = (drawID = Math.random());
    let xSize = canvas.width * reso;
    let ySize = canvas.height * reso;
    let colsDrawn = 0;

    let numCols = Math.ceil(canvas.width * reso);
    let numRows = Math.ceil(canvas.height * reso);

    for (let i of shuffle(Array.from({ length: numCols }, (_, i) => i))) {
      colsDrawn++;
      for (let j = 0; j < numRows; j++) {
        let x = xStart + ((xEnd - xStart) * i) / xSize;
        let y = yStart + ((yEnd - yStart) * j) / ySize;

        context.fillStyle = generator([x, y], {
          seed,
          eq,
          parsedEq,
          maxIterations,
        });

        context.fillRect(i / reso, j / reso, 1 / reso, 1 / reso);
      }

      if (colsDrawn % 10 == 0) {
        await wait(0);
        if (drawID != myID) return false;
      }
    }

    return true;
  }

  /** Redraws the image. */
  async function redrawFractal() {
    let success = await redrawFractalAt(0.5);
    success &&= await redrawFractalAt(1);
    success &&= await redrawFractalAt(2);
    return success;
  }

  /**
   * Normalizes the coordinates of the grid by zooming out certain directions.
   * @returns A set of normalized coordinates.
   */
  function computeEndpoints() {
    return ((xStart, xEnd, yStart, yEnd) => {
      let xCenter = (xStart + xEnd) / 2;
      let yCenter = (yStart + yEnd) / 2;
      let xSize = Math.min(canvas.width, canvas.height) / canvas.width;
      let ySize = Math.min(canvas.width, canvas.height) / canvas.height;

      xStart -= xCenter;
      xEnd -= xCenter;
      yStart -= yCenter;
      yEnd -= yCenter;

      xStart /= xSize;
      xEnd /= xSize;
      yStart /= ySize;
      yEnd /= ySize;

      xStart += xCenter;
      xEnd += xCenter;
      yStart += yCenter;
      yEnd += yCenter;

      return { xStart, xEnd, yStart, yEnd };
    })(xStart, xEnd, yStart, yEnd);
  }

  /**
   * Zooms in on a point in the Mandelbrot set with 2x zoom.
   * @param cx The real part of the point to zoom in on.
   * @param cy The imaginary part of the point to zoom in on.
   */
  function zoomIn(cx: number, cy: number) {
    let xDelta = (xEnd - xStart) / 4;
    let yDelta = (yEnd - yStart) / 4;

    xStart = cx - xDelta;
    xEnd = cx + xDelta;
    yStart = cy - yDelta;
    yEnd = cy + yDelta;
  }

  /**
   * Zooms in on a point in the Mandelbrot set with 2x zoom.
   * @param cx The real part of the point to zoom in on.
   * @param cy The imaginary part of the point to zoom in on.
   */
  function zoomOut(cx: number, cy: number) {
    let xDelta = xEnd - xStart;
    let yDelta = yEnd - yStart;

    xStart = cx - xDelta;
    xEnd = cx + xDelta;
    yStart = cy - yDelta;
    yEnd = cy + yDelta;
  }

  /** Sets the page hash to match the current settings. */
  function setPageHash() {
    let obj: OptionList<any> = { xStart, xEnd, yStart, yEnd, maxIterations };
    if (options.saveSeed) obj.seed = seed;
    if (options.saveEq) obj.eq = eq;

    setLocationHash(JSON.stringify(obj));
  }

  /** Sets the page title according to the resolution. */
  function setPageTitle() {
    document.title = title.replace("{EQ}", eq);
  }

  setPageTitle();
  setPageHash();
  redrawFractal();

  $("#canvas").on("click", ({ target, clientX, clientY, shiftKey }) => {
    let { left, top, height, width } = target.getBoundingClientRect();
    let x = clientX - left;
    let y = clientY - top;
    let cx = xStart + ((xEnd - xStart) * x) / width;
    let cy = yStart + ((yEnd - yStart) * y) / height;

    if (shiftKey) zoomOut(cx, cy);
    else zoomIn(cx, cy);
    setPageHash();
    redrawFractal();
  });

  $("#icon-blur").on("click", () => {
    if (maxIterations <= 5) maxIterations = 5;
    else if (maxIterations <= 25) maxIterations -= 5;
    else if (maxIterations <= 50) maxIterations = 25;
    else maxIterations -= 50;

    setPageHash();
    redrawFractal();
  });

  $("#icon-focus").on("click", () => {
    if (maxIterations < 5) maxIterations = 5;
    else if (maxIterations < 25) maxIterations += 5;
    else if (maxIterations < 50) maxIterations = 50;
    else maxIterations += 50;

    setPageHash();
    redrawFractal();
  });

  $("#icon-zoomin").on("click", () => {
    zoomIn((xStart + xEnd) / 2, (yStart + yEnd) / 2);
    setPageHash();
    redrawFractal();
  });

  $("#icon-zoomout").on("click", () => {
    zoomOut((xStart + xEnd) / 2, (yStart + yEnd) / 2);
    setPageHash();
    redrawFractal();
  });

  $("#icon-reseed").on("click", () => {
    seed = Math.random();
    setPageHash();
    redrawFractal();
  });

  $("#icon-neweq").on("click", () => {
    eq = prompt("Enter an equation", eq) || eq;
    parsedEq = options.eqParser?.(eq) ?? parsedEq;
    setPageTitle();
    setPageHash();
    redrawFractal();
  });

  function onResize() {
    canvas.style.display = "none";
    canvas.width = 2 * $.main.width();
    canvas.height = 2 * $.main.height();
    canvas.style.display = "block";

    redrawFractal();
  }

  window.addEventListener("resize", onResize);
  onResize();
}

/** The type of a coordinate transformer. */
export type Transformer = (z: Complex, c: Complex) => Complex;

/**
 * Creates a fractal generator using Mandelbrot Set-style logic.
 * @param transformer The coordinate transformer.
 * @param options A list of options to use.
 */
export function createMandelbrotLike(
  transformer: Transformer,
  { escapeSize = 4, ...options }: OptionList<any> & { escapeSize?: number } = {}
) {
  createFractal((c, { maxIterations }) => {
    let z: Complex = [0, 0];
    let iter = 0;

    do {
      z = transformer(z, c);
      iter++;
    } while (abs2(z) <= escapeSize && iter < maxIterations);

    let frac = 1 - iter / maxIterations;
    if (frac) return `hsl(${360 * ((frac * 2) % 1)}, 100%, 50%)`;
    else return "black";
  }, options);
}
