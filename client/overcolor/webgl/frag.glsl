#version 300 es

precision highp float;
uniform sampler2D u_image;

in vec2 v_texCoord;
out vec4 outColor;

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);

  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

vec3 rgb2hsl(vec3 c) {
  float h = 0.0;
  float s = 0.0;
  float l = 0.0;
  float r = c.r;
  float g = c.g;
  float b = c.b;
  float cMin = min(r, min(g, b));
  float cMax = max(r, max(g, b));

  l = (cMax + cMin) / 2.0;
  if(cMax > cMin) {
    float cDelta = cMax - cMin;
    s = l < 0.0 ? cDelta / (cMax + cMin) : cDelta / (2.0 - (cMax + cMin));

    if(r == cMax) {
      h = (g - b) / cDelta;
    } else if(g == cMax) {
      h = 2.0 + (b - r) / cDelta;
    } else {
      h = 4.0 + (r - g) / cDelta;
    }

    if(h < 0.0) {
      h += 6.0;
    }
    h = h / 6.0;
  }
  return vec3(h, s, l);
}

void main() {
  vec4 image = texture(u_image, v_texCoord);
  vec3 hsl = rgb2hsl(image.rgb);
  vec3 rgb = hsl2rgb(vec3(hsl.x, 1, 0.5));

  // if (max(image.r, max(image.g, image.b)) - min(image.r, min(image.g, image.b)) <= 8.0) {
  //   float avg = (image.r + image.g + image.b) / 3.0;
  //   rgb = vec3(avg, avg, avg);
  // }

  outColor = vec4(rgb, image.a);
}
