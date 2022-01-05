/** The type of a complex number. */
export type Complex = [real: number, imaginary: number];

/**
 * Adds two complex numbers together.
 * @param a The first complex number.
 * @param b The second complex number.
 * @returns The sum of the two complex numbers.
 */
export function add([ax, ay]: Complex, [bx, by]: Complex): Complex {
  return [ax + bx, ay + by];
}

/**
 * Subtracts two complex numbers.
 * @param a The first complex number.
 * @param b The second complex number.
 * @returns The difference of the two complex numbers.
 */
export function sub([ax, ay]: Complex, [bx, by]: Complex): Complex {
  return [ax - bx, ay - by];
}

/**
 * Multiplies two complex numbers.
 * @param a The first complex number.
 * @param b The second complex number.
 * @returns The product of the two complex numbers.
 */
export function mult([ax, ay]: Complex, [bx, by]: Complex): Complex {
  return [ax * bx - ay * by, ax * by + ay * bx];
}

/**
 * Divides two complex numbers.
 * @param a The first complex number.
 * @param b The second complex number.
 * @returns The quotient of the two complex numbers.
 */
export function div([ax, ay]: Complex, [bx, by]: Complex): Complex {
  let d = bx * bx + by * by;
  return [(ax * bx + ay * by) / d, (ay * bx - ax * by) / d];
}

/**
 * Computes the square of the absolute value of a complex number.
 * @param z The complex number.
 * @returns The square of the absolute value of the complex number.
 */
export function abs2([ax, ay]: Complex): number {
  return ax * ax + ay * ay;
}

/**
 * Computes the absolute value of a complex numbers.
 * @param z The first complex number.
 * @returns The absolute value of the complex number.
 */
export function abs(z: Complex): number {
  return Math.sqrt(abs2(z));
}

/**
 * Computes the squared distance between two complex numbers.
 * @param z1 The first complex number.
 * @param z2 The second complex number.
 * @returns The squared distance between the two complex numbers.
 */
export function dist2(z1: Complex, z2: Complex): number {
  return abs2(sub(z1, z2));
}

/**
 * Computes the distance between two complex numbers.
 * @param z1 The first complex number.
 * @param z2 The second complex number.
 * @returns The distance between the two complex numbers.
 */
export function dist(z1: Complex, z2: Complex): number {
  return Math.sqrt(dist2(z1, z2));
}

/**
 * Finds the square of a complex number.
 * @param z The complex number.
 * @returns The square of the complex number.
 */
export function sqr([x, y]: Complex): Complex {
  return [x * x - y * y, 2 * x * y];
}

/**
 * Finds the cube of a complex number.
 * @param z The complex number.
 * @returns The cube of the complex number.
 */
export function cube([x, y]: Complex): Complex {
  return [x * x * x - 3 * x * y * y, 3 * x * x * y - y * y * y];
}

/**
 * Finds the angle of this complex number relative to the origin.
 * @param z The complex number.
 * @returns The angle of the complex number in radians.
 */
export function angle([x, y]: Complex): number {
  return Math.atan2(y, x) + Math.PI * +(x < 0);
}
