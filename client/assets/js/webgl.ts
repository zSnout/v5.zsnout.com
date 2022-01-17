import $ from "./jsx.js";
import { getLocationHash, setLocationHash } from "./util.js";

/**
 * Compiles a GLSL shader.
 * @param gl The WebGL2 context.
 * @param type The type of shader to create.
 * @param source The source code of the shader.
 * @returns A shader object or `null`.
 */
export function createShader(
  gl: WebGL2RenderingContext,
  type: "VERTEX" | "FRAGMENT",
  source: string
) {
  let shader = gl.createShader(gl[`${type}_SHADER`])!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

/**
 * Compiles a GLSL program.
 * @param gl The WebGL2 context.
 * @param shaders The shaders to attach to the program.
 * @returns A program object or `null`.
 */
export function createProgram(
  gl: WebGL2RenderingContext,
  ...shaders: WebGLShader[]
) {
  let program = gl.createProgram()!;
  shaders.map((e) => gl.attachShader(program, e));
  gl.linkProgram(program);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

/** A list of options that can be passed to a fractal generator. */
export interface OptionList {
  title?: string;
  xStart?: number;
  xEnd?: number;
  yStart?: number;
  yEnd?: number;
  colorMode?: number;
  maxIterations?: number;
}

/**
 * Creates a fractal generator using the standard toolbar.
 * @param generator The fractal generator to use.
 * @param options A list of options to use.
 */
export async function createFractal(
  init: (gl: WebGL2RenderingContext, ...shaders: WebGLShader[]) => WebGLProgram,
  {
    title = "Unnamed Fractal",
    vertexShader,
    fragmentShader,
    ...options
  }: OptionList & { vertexShader: string; fragmentShader: string }
) {
  let json: OptionList = {};
  try {
    let parsed = JSON.parse(getLocationHash());
    if (typeof parsed == "object" && parsed !== null) json = parsed;
  } catch {}

  let canvas = $("#canvas")[0] as HTMLCanvasElement;
  let gl = canvas.getContext("webgl2")!;

  let maxIterations = json.maxIterations ?? options.maxIterations ?? 100;
  let xStart = json.xStart ?? options.xStart ?? -1;
  let xEnd = json.xEnd ?? options.xEnd ?? 1;
  let yStart = json.yStart ?? options.yStart ?? -1;
  let yEnd = json.yEnd ?? options.yEnd ?? 1;
  let colorMode = json.colorMode ?? options.colorMode ?? 0;

  let vertShaderSrc = await fetch(vertexShader).then((e) => e.text());
  let fragShaderSrc = await fetch(fragmentShader).then((e) => e.text());
  let vertShader = createShader(gl, "VERTEX", vertShaderSrc)!;
  let fragShader = createShader(gl, "FRAGMENT", fragShaderSrc)!;
  let program = init(gl, vertShader, fragShader);

  let scaleLoc = gl.getUniformLocation(program, "scale");
  let offsetLoc = gl.getUniformLocation(program, "offset");
  let colorModeLoc = gl.getUniformLocation(program, "colorMode");
  let maxIterationsLoc = gl.getUniformLocation(program, "maxIterations");

  /** Updates the variables in the GLSL script. */
  function updateGl() {
    let xScale = (xEnd - xStart) / 2;
    let yScale = (yEnd - yStart) / 2;

    gl.uniform1i(maxIterationsLoc, Math.floor(maxIterations));
    gl.uniform1i(colorModeLoc, Math.floor(colorMode + 3) % 3);
    gl.uniform2fv(scaleLoc, [xScale, yScale]);
    gl.uniform2fv(offsetLoc, [xStart + xScale, yStart + yScale]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Zooms in on a point in the Mandelbrot set with 2x zoom.
   * @param cx The real part of the point to zoom in on.
   * @param cy The imaginary part of the point to zoom in on.
   */
  function zoomIn(cx: number, cy: number, delta = 2.01) {
    let xDelta = (xEnd - xStart) / delta;
    let yDelta = (yEnd - yStart) / delta;

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
  function zoomOut(cx: number, cy: number, delta = 1.99) {
    let xDelta = (xEnd - xStart) / delta;
    let yDelta = (yEnd - yStart) / delta;

    xStart = cx - xDelta;
    xEnd = cx + xDelta;
    yStart = cy - yDelta;
    yEnd = cy + yDelta;
  }

  let lastHashChange = 0;

  /** Sets the page hash to match the current settings. */
  function setPageHash(checkLastChange = false) {
    if (checkLastChange && Date.now() - lastHashChange < 500) return;
    lastHashChange = Date.now();

    let obj: OptionList = {
      xStart,
      xEnd,
      yStart,
      yEnd,
      colorMode,
      maxIterations,
    };

    setLocationHash(JSON.stringify(obj));
  }

  /** Sets the page title according to the settings.. */
  function setPageTitle() {
    document.title = title;
  }

  setPageTitle();
  setPageHash();
  updateGl();

  let zoomType: "in" | "out" | "none" = "none";
  let zoomX = (xEnd - xStart) / 2;
  let zoomY = (yEnd - yStart) / 2;

  function onMouse({ type, clientX, clientY, button }: MouseEvent) {
    if (type == "mouseup") return (zoomType = "none");
    if (type == "mousemove" && zoomType == "none") return;
    if (type == "mousedown") zoomType = button == 2 ? "out" : "in";

    let { left, top, height, width } = canvas.getBoundingClientRect();
    let x = clientX - left;
    let y = clientY - top;

    zoomX = x / width - 0.5;
    zoomY = 1 - y / height - 0.5;
  }

  $(canvas).on("contextmenu", (e) => e.preventDefault());
  $(canvas).on("mousedown", onMouse);
  $(canvas).on("mousemove", onMouse);
  $("html").on("mouseup", onMouse);

  setInterval(() => {
    if (zoomType == "none") return;

    let x = (xStart + xEnd) / 2;
    let y = (yStart + yEnd) / 2;
    let xs = (xEnd - xStart) / 2;
    let ys = (yEnd - yStart) / 2;

    x = x + (zoomX * xs) / 100;
    y = y + (zoomY * ys) / 100;

    if (zoomType == "out") zoomOut(x, y);
    else zoomIn(x, y);

    setPageHash(true);
    updateGl();
  }, 10);

  $("#icon-blur").on("click", () => {
    if (maxIterations <= 5) maxIterations = 5;
    else if (maxIterations <= 25) maxIterations -= 5;
    else if (maxIterations <= 50) maxIterations = 25;
    else maxIterations -= 50;

    setPageHash();
    updateGl();
  });

  $("#icon-focus").on("click", () => {
    if (maxIterations < 5) maxIterations = 5;
    else if (maxIterations < 25) maxIterations += 5;
    else if (maxIterations < 50) maxIterations = 50;
    else maxIterations += 50;

    setPageHash();
    updateGl();
  });

  $("#icon-zoomin").on("click", () => {
    zoomIn((xStart + xEnd) / 2, (yStart + yEnd) / 2, 4);
    setPageHash();
    updateGl();
  });

  $("#icon-zoomout").on("click", () => {
    zoomOut((xStart + xEnd) / 2, (yStart + yEnd) / 2, 1);
    setPageHash();
    updateGl();
  });

  $("#icon-recolor").on("click", () => {
    colorMode = Math.floor(colorMode + 1) % 3;
    setPageHash();
    updateGl();
  });

  $("#canvas").autoResize();
}
