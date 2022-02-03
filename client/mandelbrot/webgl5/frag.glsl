#version 300 es

precision highp float;
in vec2 _pos;
out vec4 color;
uniform int maxIterations;
uniform float decimalVal;

// 0 - INT_NONE, EXT_TIME
// 1 - INT_ORBIT, EXT_NONE
// 2 - INT_ORBIT, EXT_ORBIT
uniform int colorMode;

uniform vec2 scale;
uniform vec2 offset;

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);

  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

vec3 palette(float t) {
  float hue = mod(2.0 * t, 1.0);
  return hsl2rgb(vec3(1.0 - hue, 1.0, 0.5));
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

vec4 iterate(vec2 c) {
  vec2 z, pz, ppz;
  vec3 sz;

  int iterations = 0;
  for(int i = 0; i < maxIterations; i++) {
    ppz = pz;
    pz = z;
    z = div(mult(mult(z, z), z) + vec2(decimalVal, 0), mult(c, mult(z, z)) + vec2(1, 0));
    iterations++;
    if(length(z) > 2.0)
      break;

    sz.x += dot(z - pz, pz - ppz);
    sz.y += dot(z - pz, z - pz);
    sz.z += dot(z - ppz, z - ppz);
  }

  return vec4(sz, iterations);
}

void main() {
  vec2 c = _pos * scale + offset;
  vec4 res = iterate(c);

  vec3 sz = res.xyz;
  float iterations = res.w;

  float frac = float(iterations) / float(maxIterations);
  if(frac < 1.0 && (colorMode == 0)) {
    // interior, mode 0
    color = vec4(palette(frac), 1);
  } else if(colorMode == 2 || (frac >= 1.0 && colorMode == 1)) {
    // interior, mode 2
    // exterior, modes 2, 1
    sz = abs(sz) / float(iterations);
    vec3 n1 = sin(abs(sz * 5.0)) * 0.45 + 0.5;
    color = vec4(n1, 1);
  } else {
    // interior, mode 1
    // exterior, mode 0
    color = vec4(0, 0, 0, 1);
  }
}
