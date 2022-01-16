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
