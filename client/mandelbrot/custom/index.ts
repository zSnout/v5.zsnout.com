import { createFractal, createProgram } from "../../assets/js/webgl.js";

createFractal(
  (gl, ...shaders) => {
    let program = createProgram(gl, ...shaders)!;
    gl.useProgram(program);

    let posAttrLocation = gl.getAttribLocation(program, "pos");
    gl.enableVertexAttribArray(posAttrLocation);

    let buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, -1]),
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, false, 0, 0);

    return program;
  },
  {
    title: "Custom Fractal ({EQ})",
    xStart: -2,
    xEnd: 2,
    yStart: 2,
    yEnd: -2,
    maxIterations: 150,
    colorMode: 1,
    colorModeCount: 7,
    vertexShader: "./vert.glsl",
    fragmentShader: "./frag.glsl",
    saveEQs: "iter",
    iterEQ: "z^2 + c",
    showIterEQ: true,
  }
);
