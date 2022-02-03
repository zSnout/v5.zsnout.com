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
    title: "Infinite Puddles",
    xStart: -8,
    xEnd: 8,
    yStart: 8,
    yEnd: -8,
    maxIterations: 150,
    colorMode: 2,
    vertexShader: "./vert.glsl",
    fragmentShader: "./frag.glsl",
  }
);
