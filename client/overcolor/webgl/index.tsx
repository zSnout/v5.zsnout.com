import { createProgram, createShader } from "../../assets/js/webgl.js";
import $, { jsx } from "../../assets/js/jsx.js";
import {
  getStorage,
  onStorageChange,
  setStorage,
} from "../../assets/js/util.js";

let output = $("#output")[0] as HTMLCanvasElement;
let gl = output.getContext("webgl2")!;
let info = $("#info");
let sources = Promise.all([fetch("./vert.glsl"), fetch("./frag.glsl")]);

info.on("click", async () => {
  try {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true });
    let video = (<video />)[0] as HTMLVideoElement;
    video.srcObject = stream;
    await video.play();
    $.main.addClass("hasimage");

    let [vSrc, fSrc] = await Promise.all((await sources).map((e) => e.text()));
    let vertShader = createShader(gl, "VERTEX", vSrc)!;
    let fragShader = createShader(gl, "FRAGMENT", fSrc)!;
    let program = createProgram(gl, vertShader, fragShader)!;
    gl.useProgram(program);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    function renderImage(image: HTMLImageElement) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      let posAttrLoc = gl.getAttribLocation(program, "a_position");
      let texCoordAttrLoc = gl.getAttribLocation(program, "a_texCoord");

      let resUniformLoc = gl.getUniformLocation(program, "u_resolution");
      let imgUniformLoc = gl.getUniformLocation(program, "u_image");

      let vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      let positionBuffer = gl.createBuffer();
      gl.enableVertexAttribArray(posAttrLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

      let texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        ]),
        gl.STATIC_DRAW
      );

      gl.enableVertexAttribArray(texCoordAttrLoc);
      gl.vertexAttribPointer(texCoordAttrLoc, 2, gl.FLOAT, false, 0, 0);
      let texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + 0);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );

      gl.bindVertexArray(vao);
      gl.uniform2f(resUniformLoc, gl.canvas.width, gl.canvas.height);
      gl.uniform1i(imgUniformLoc, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      let w = image.width;
      let h = image.height;
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 0, w, 0, 0, h, 0, h, w, 0, w, h]),
        gl.STATIC_DRAW
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function renderFrame() {
      let canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);

      let data = canvas.toDataURL("image/png");
      let image = new Image();
      image.src = data;
      image.onload = () => {
        renderImage(image);
        requestAnimationFrame(renderFrame);
      };
    }

    gl.canvas.width = video.videoWidth;
    gl.canvas.height = video.videoHeight;
    gl.canvas?.captureStream();
    renderFrame();
  } catch {
    info.text(
      "Sorry, we weren't able to get camera permissions. Try again by clicking this paragraph, or reload the page."
    );
  }
});

$("#icon-resize").on("click", () =>
  setStorage(
    "overcolor:cover",
    getStorage("overcolor:cover") == "true" ? "false" : "true"
  )
);

function onResize(status = getStorage("overcolor:cover")) {
  if (status == "true") $.main.addClass("cover");
  else $.main.removeClass("cover");
}

onStorageChange("overcolor:cover", onResize);
onResize();

declare global {
  interface StorageItems {
    "overcolor:cover": "true" | "false";
  }
}
