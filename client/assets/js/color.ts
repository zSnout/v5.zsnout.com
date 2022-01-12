// {@linkcode rgbToHsl} is adapted from https://30secondsofcode.org/js/s/rgb-to-hsl.
// {@linkcode hslToRgb} is adapted from https://30secondsofcode.org/js/s/hsl-to-rgb.

/**
 * Converts an RGB color to HSL.
 * @param red The amount of red in the color.
 * @param green The amount of green in the color.
 * @param blue The amount of blue in the color.
 * @returns The color as an HSL tuple.
 */
export function rgbToHsl(
  red: number,
  green: number,
  blue: number
): [hue: number, saturation: number, lightness: number] {
  (red /= 255), (green /= 255), (blue /= 255);

  let l = Math.max(red, green, blue);
  let s = l - Math.min(red, green, blue);
  let h = s
    ? l === red
      ? (green - blue) / s
      : l === green
      ? 2 + (blue - red) / s
      : 4 + (red - green) / s
    : 0;

  let finalHue = 60 * h < 0 ? 60 * h + 360 : 60 * h;
  let finalSat =
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0);
  let finalLight = (100 * (2 * l - s)) / 2;

  return [finalHue, finalSat / 100, finalLight / 100];
}

/**
 * Converts an HSL color to RGB.
 * @param hue The hue of the color.
 * @param saturation The saturation of the color.
 * @param lightness The lightness of the color.
 * @returns The color as an RGB tuple.
 */
export function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number
): [red: number, green: number, blue: number] {
  let k = (n: number) => (n + hue / 30) % 12;
  let a = saturation * Math.min(lightness, 1 - lightness);
  let f = (n: number) =>
    lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return [255 * f(0), 255 * f(8), 255 * f(4)];
}
