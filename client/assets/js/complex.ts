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
