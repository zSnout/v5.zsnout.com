#version 300 es

precision highp float;
in vec2 pos;
out vec2 _pos;

void main() {
  gl_Position = vec4(_pos = pos, 0, 1);
}
