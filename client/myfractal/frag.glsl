#version 300 es

precision highp float;
in vec2 _pos;
out vec4 color;
uniform int maxIterations;

// 0 - MANDELBROT
// 1 - ANGULAR
// 2 - ORBITAL
uniform int colorMode;

uniform vec2 scale;
uniform vec2 offset;

vec2 pi = vec2(3.141592653589793, 0);
vec2 e = vec2(2.718281828459045, 0);
vec2 i = vec2(0, 1);

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);

  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

vec3 palette(float t) {
  float hue = mod(2.0 * t, 1.0);
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

vec2 power(vec2 a, vec2 b) {
  int count = int(b.x);
  if(count <= 1)
    return a;

  vec2 result = a;
  for(int i = 1; i < count; i++) {
    result = mult(result, a);
  }

  return result;
}

vec3 iterate(vec2 c) {
  vec2 z, pz, ppz;
  vec2 sz;

  int iterations = 0;
  for(int i = 0; i < maxIterations; i++) {
    ppz = pz;
    pz = z;
    z = ITEREQ;
    iterations++;
    if(length(z) > 2.0)
      break;

    sz = COLOREQ;
    // sz.x += dot(z - pz, pz - ppz);
    // sz.y += dot(z - pz, z - pz);
    // sz.z += dot(z - ppz, z - ppz);
  }

  return vec3(sz, iterations);
}

void main() {
  vec2 c = _pos * scale + offset;
  vec3 res = iterate(c);

  vec2 sz = res.xy;
  float iterations = res.z;

  float frac = float(iterations) / float(maxIterations);
  if(frac < 1.0 && (colorMode == 0)) {
    // interior, mode 0
    color = vec4(palette(atan(sz.y / sz.x) * frac), 1);
  } else if(colorMode == 2) {
    // interior, mode 2
    // exterior, modes 2
    sz = abs(sz);
    vec3 n1 = sin(abs(vec3(sz, 0.25) * 5.0)) * 0.45 + 0.5;
    color = vec4(n1, 1);
  } else if(colorMode == 0) {
    // exterior, mode 0
    color = vec4(0, 0, 0, 1);
  } else {
    // mode 1
    float angle = atan(sz.y / sz.x);
    color = vec4(palette(angle), 1);
  }
}
