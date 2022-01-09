import $ from "./jsx.js";
import { getLocationHash, setLocationHash, shuffle, wait } from "./util.js";

/** A list of options that can be passed to a fractal generator. */
export interface OptionList {
  title?: string;
  xStart?: number;
  xEnd?: number;
  yStart?: number;
  yEnd?: number;
  maxIterations?: number;
  seed?: number;
  useSeed?: boolean;
  canvasSize?: 340 | 680 | 1360 | 2720;
}

/** Data passed to a {@linkcode FractalGenerator}. */
export interface GeneratorInformation {
  x: number;
  y: number;
  seed: number;
  maxIterations: number;
}

/** The type of a fractal generator. */
export type FractalGenerator = (data: GeneratorInformation) => string;

/**
 * Creates a fractal generator using the standard toolbar.
 * @param generator The fractal generator to use.
 * @param options A list of options to use.
 */
export default function createFractal(
  generator: FractalGenerator,
  { title = "Unnamed Fractal", ...options }: OptionList = {}
) {
  let json: OptionList = {};
  try {
    let parsed = JSON.parse(getLocationHash());
    if (typeof parsed == "object" && parsed !== null) json = parsed;
  } catch {}

  let canvas = $("#canvas")[0] as HTMLCanvasElement;
  let context = canvas.getContext("2d")!;

  let canvasSize: 340 | 680 | 1360 | 2720 =
    json.canvasSize ?? (options.canvasSize || 680);
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  let seed = json.seed ?? options.seed ?? Math.random();
  let maxIterations = json.maxIterations ?? options.maxIterations ?? 100;
  let xStart = json.xStart ?? options.xStart ?? -1;
  let xEnd = json.xEnd ?? options.xEnd ?? 1;
  let yStart = json.yStart ?? options.yStart ?? -1;
  let yEnd = json.yEnd ?? options.yEnd ?? 1;

  /** The ID of the current drawing. */
  let drawID = 0;

  /**
   * Redraws the image at a specific resolution.
   * @param size The size of the image to draw.
   * @returns A promise resolving to a boolean indicating whether the fractal was drawn without being canceled.
   */
  async function redrawFractalAt(size: number) {
    let myID = (drawID = Math.random());
    let pixelSize = canvasSize / size;
    let colsDrawn = 0;

    for (let i of shuffle(Array.from({ length: size }, (_, i) => i))) {
      colsDrawn++;
      for (let j = 0; j < size; j++) {
        let x = xStart + ((xEnd - xStart) * i) / size;
        let y = yStart + ((yEnd - yStart) * j) / size;
        context.fillStyle = generator({ x, y, seed, maxIterations });
        context.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
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
    let success = await redrawFractalAt(340);
    if (success && canvasSize > 340) success = await redrawFractalAt(680);
    if (success && canvasSize > 680) success = await redrawFractalAt(1360);
    if (success && canvasSize > 1360) success = await redrawFractalAt(2720);
    return success;
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
    let obj: OptionList = {
      xStart,
      xEnd,
      yStart,
      yEnd,
      maxIterations,
      canvasSize,
    };
    if (options.useSeed) obj.seed = seed;

    setLocationHash(JSON.stringify(obj));
  }

  /** Sets the page title according to the resolution. */
  function setPageTitle() {
    document.title = `${title} at ${canvasSize / 680}x`;
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

  $("#icon-resolution").on("click", () => {
    if (canvasSize == 340) canvasSize = 680;
    else if (canvasSize == 680) canvasSize = 1360;
    else if (canvasSize == 1360) canvasSize = 2720;
    else canvasSize = 340;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    setPageTitle();
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

  $("#canvas").autoResize();
}
