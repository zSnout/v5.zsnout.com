#version 300 es

precision highp float;
in vec2 _pos;
out vec4 color;
uniform int maxIterations;

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

void main() {
  vec2 c = _pos * scale + offset, z;

  int iterations = 0;
  for(int i = 0; i < maxIterations; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * abs(z.x) * abs(z.y)) + c;
    iterations++;
    if(length(z) > 2.0)
      break;
  }

  float frac = float(iterations) / float(maxIterations);
  color = frac >= 1.0 ? vec4(0, 0, 0, 1) : vec4(palette(frac), 1);
}
