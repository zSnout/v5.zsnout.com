#version 300 es

precision highp float;
in vec2 _pos;
out vec4 color;
uniform int maxIterations;

uniform vec2 scale;
uniform vec2 offset;

float pi = 3.1415926535897932384626433832795;

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);

  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

vec3 palette(float t) {
  float hue = t / pi;
  return hsl2rgb(vec3(1.0 - hue, 1.0, 0.5));
}

vec2 cube(vec2 a) {
  float x2 = a.x * a.x;
  float y2 = a.y * a.y;
  float d = x2 - y2;
  return vec2(a.x * (d - y2 - y2), a.y * (x2 + x2 + d));
}

vec2 sqr(vec2 a) {
  return vec2(a.x * a.x - a.y * a.y, 2.0 * a.x * a.y);
}

vec2 mult(vec2 a, vec2 b) {
  float x = a.x * b.x - a.y * b.y;
  float y = a.x * b.y + a.y * b.x;
  return vec2(x, y);
}

vec2 div(vec2 a, vec2 b) {
  float denom = 1.0 / (b.x * b.x + b.y * b.y);
  return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) * denom;
}

vec2 iterate(vec2 c) {
  vec2 z = vec2(0, 0);
  vec2 sz = vec2(0, 0);
  vec2 sc = c - vec2(1, 0);
  for(int i = 0; i < maxIterations; i++) {
    vec2 result = cube(z) + mult(sc, z) - c;
    vec2 deriv = mult(vec2(3, 0), sqr(z)) + sc;

    z = z - div(result, deriv);
    sz = sin(sz + z) + cos(sz) + z;
  }

  return sz;
}

void main() {
  vec2 c = _pos * scale + offset;
  vec2 z = iterate(c);

  float angle = atan(z.y / z.x);
  color = vec4(palette(angle), 1);
}
