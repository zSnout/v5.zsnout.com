import $ from "./jsx.js";
import { rpnToGLSL, toReversePolish } from "./math.js";
import { getLocationHash, randint, setLocationHash, shuffle } from "./util.js";

/** A list of names for different equations. */
let eqMap: Record<string, string> = {
  "z^2+c": "Mandelbrot Set",
  "z^3+c": "Multibrot Set",
  "z^2+z+c": "Mandelblob Set",
  "z^2+1/c": "Droplet",
  "z^3-z^2-z-c": "Snowflake",
  "(z^3+1)/(cz^2+1)": "Infinite Puddles",
  "z^2+z+1/c": "Telescope",
  "z^2-z+1/c": "Rays",
};

/**
 * Converts an equation to GLSL.
 * @param equation The equation to convert.
 * @returns GLSL code that draws the equation.
 */
function eqToGLSL(equation: string) {
  return rpnToGLSL(toReversePolish(equation));
}

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
  iterEQ?: string;
  colorEQ?: string;
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
  }: OptionList & {
    vertexShader: string;
    fragmentShader: string;
    colorModeCount?: number;
    saveEQs?: boolean | "iter" | "color";
    showIterEQ?: boolean;
  }
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
  let iterEQ = json.iterEQ ?? options.iterEQ ?? "z^2 + c";
  let colorEQ = json.colorEQ ?? options.colorEQ ?? "sz + z";
  let colorModeCount = options.colorModeCount ?? 3;

  let vertShaderSrc = await fetch(vertexShader).then((e) => e.text());
  let fragShaderSrc = await fetch(fragmentShader)
    .then((e) => e.text())
    .then((e) => e.replace("ITEREQ", eqToGLSL(iterEQ)))
    .then((e) => e.replace("COLOREQ", eqToGLSL(colorEQ)));
  let vertShader = createShader(gl, "VERTEX", vertShaderSrc)!;
  let fragShader = createShader(gl, "FRAGMENT", fragShaderSrc)!;
  let program = init(gl, vertShader, fragShader);

  let scaleLoc = gl.getUniformLocation(program, "scale");
  let offsetLoc = gl.getUniformLocation(program, "offset");
  let colorModeLoc = gl.getUniformLocation(program, "colorMode");
  let maxIterationsLoc = gl.getUniformLocation(program, "maxIterations");

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

  /** Updates the variables in the GLSL script. */
  function updateGl() {
    let { xStart, xEnd, yStart, yEnd } = computeEndpoints();
    let xScale = (xEnd - xStart) / 2;
    let yScale = (yEnd - yStart) / 2;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1i(maxIterationsLoc, Math.floor(maxIterations));
    gl.uniform1i(
      colorModeLoc,
      Math.floor(colorMode + colorModeCount) % colorModeCount
    );
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
   * Zooms out on a point in the Mandelbrot set with 2x zoom.
   * @param cx The real part of the point to zoom out on.
   * @param cy The imaginary part of the point to zoom out on.
   */
  function zoomOut(cx: number, cy: number, delta = 2) {
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
      maxIterations,
      xStart,
      xEnd,
      yStart,
      yEnd,
      colorMode,
    };

    if (options.saveEQs === true || options.saveEQs === "iter")
      obj.iterEQ = iterEQ;
    if (options.saveEQs === true || options.saveEQs === "color")
      obj.colorEQ = colorEQ;

    setLocationHash(JSON.stringify(obj));
  }

  /** Sets the page title according to the settings.. */
  function setPageTitle() {
    let pageTitle = title.replaceAll("{EQ}", iterEQ);

    if (options.showIterEQ) {
      let eq = iterEQ.replace(/\s+/g, "");
      if (eq in eqMap) pageTitle = eqMap[eq];
    }

    document.title = pageTitle;
  }

  setPageTitle();
  setPageHash();
  updateGl();

  let zoomType: "in" | "out" | "none" = "none";
  let zoomX = (xEnd - xStart) / 2;
  let zoomY = (yEnd - yStart) / 2;

  function onMouse({ type, clientX, clientY, button, shiftKey }: MouseEvent) {
    if (button != 0) return;
    if (type == "mouseup") return (zoomType = "none");
    if (type == "mousemove" && zoomType == "none") return;
    if (type == "mousedown") zoomType = shiftKey === true ? "out" : "in";

    let { left, top, height, width } = canvas.getBoundingClientRect();
    let x = (clientX - left) / width - 0.5;
    let y = 1 - (clientY - top) / height - 0.5;

    let size = Math.min(width, height);
    zoomX = (x / size) * width;
    zoomY = (y / size) * height;
  }

  function onKey({ shiftKey, key, type }: KeyboardEvent) {
    if (type == "keydown") {
      if (key == "-" || key == "_")
        zoomOut((xStart + xEnd) / 2, (yStart + yEnd) / 2, 1);
      if (key == "+" || key == "=")
        zoomIn((xStart + xEnd) / 2, (yStart + yEnd) / 2, 4);
      if (key == "-" || key == "+" || key == "=" || key == "_")
        return setPageHash(), updateGl();
    }

    if (zoomType == "none") return;
    if (shiftKey === true) zoomType = "out";
    if (shiftKey === false) zoomType = "in";
  }

  function onWheel({ offsetX, offsetY, deltaY }: WheelEvent) {
    let { height, width } = canvas.getBoundingClientRect();
    let s = Math.min(height, width);
    let x = (offsetX - (width - s) / 2) / s / 100;
    let y = (height - offsetY - (height - s) / 2) / s / 100;
    let f = Math.min(Math.abs(deltaY), 5);
    x *= f;
    y *= f;

    if (deltaY < 0) {
      xStart += x * (xEnd - xStart);
      xEnd -= (0.01 * f - x) * (xEnd - xStart);
      yStart += y * (yEnd - yStart);
      yEnd -= (0.01 * f - y) * (yEnd - yStart);
    } else {
      xStart -= x * (xEnd - xStart);
      xEnd += (0.01 * f - x) * (xEnd - xStart);
      yStart -= y * (yEnd - yStart);
      yEnd += (0.01 * f - y) * (yEnd - yStart);
    }

    setPageHash(true), updateGl();
  }

  $.root.on("keydown", onKey).on("keyup", onKey).on("mouseup", onMouse);
  $(canvas).on("mousedown", onMouse).on("mousemove", onMouse);
  $(canvas).on("wheel", onWheel).on("wheel", (e) => e.preventDefault()); // prettier-ignore

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
    colorMode = Math.floor(colorMode + 1) % colorModeCount;
    setPageHash();
    updateGl();
  });

  $("#icon-itereq").on("click", () => {
    let old = iterEQ;
    iterEQ =
      prompt(
        "Enter an equation to iterate. You may use z, c, pz, ppz, and sz.",
        iterEQ
      ) || iterEQ;
    if (iterEQ == old) return;

    setPageHash();
    location.reload();
  });

  $("#icon-randeq").on("click", () => {
    iterEQ = shuffle(Object.keys(eqMap).filter((e) => e != iterEQ))[0];
    colorMode = randint(1, colorModeCount - 1);

    setPageHash();
    location.reload();
  });

  $("#icon-coloreq").on("click", () => {
    let old = colorEQ;
    colorEQ =
      prompt(
        "Enter an equation to use for sz. You may use z, c, pz, ppz, and sz.",
        colorEQ
      ) || colorEQ;
    if (colorEQ == old) return;

    setPageHash();
    location.reload();
  });

  function onResize() {
    canvas.style.display = "none";
    canvas.width = 2 * $.main.width();
    canvas.height = 2 * $.main.height();
    canvas.style.display = "block";

    updateGl();
  }

  window.addEventListener("resize", onResize);
  onResize();
}
