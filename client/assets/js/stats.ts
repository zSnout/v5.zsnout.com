// In JSDocs, we use "set" instead of "array" to denote an array of values.

/** A list of items. Used in spread operators in this library. */
export type ItemList<T = number> = (readonly T[] | T)[];

/**
 * Finds the minimum number in a set.
 * @param nums The set to look in.
 * @returns The smallest number in the set.
 */
export function min(...nums: ItemList): number {
  return Math.min(...nums.flat());
}

/**
 * Finds the maximum number in a set.
 * @param nums The set to look in.
 * @returns The largest number in the set.
 */
export function max(...nums: ItemList) {
  return Math.max(...nums.flat());
}

/**
 * Finds the range of a set.
 * @param nums The set to look in.
 * @returns The range of the set.
 */
export function range(...nums: ItemList) {
  return max(...nums) - min(...nums);
}

/**
 * Finds the sum of all elements in a set.
 * @param nums The set to look in.
 * @returns The sum of all elements in the set.
 */
export function sum(...nums: ItemList) {
  return nums.flat().reduce((a, b) => a + b);
}

/**
 * Finds the product of all elements in a set.
 * @param nums The set to look in.
 * @returns The product of all elements in the set.
 */
export function product(...nums: ItemList) {
  return nums.flat().reduce((a, b) => a * b);
}

/**
 * Sorts elements in a set by their numerical value.
 * @param nums The set to look in.
 * @returns A sorted set.
 */
export function sort(...nums: ItemList) {
  return nums.flat().sort((a, b) => a - b);
}

/**
 * Finds the frequency of elements in a set.
 * @param items The set to look in.
 * @returns An Object.entries-style array of the frequency of each element.
 */
export function frequency<T = number>(
  ...items: ItemList<T>
): [item: T, frequency: number][] {
  let entries = new Map<T, number>();
  for (let item of items.flat() as T[])
    entries.set(item, (entries.get(item) || 0) + 1);

  return [...entries.entries()];
}

/**
 * Finds the frequency of a certain element in a set.
 * @param searchElement The item to look for.
 * @param items The set to look in.
 * @returns The number of times the element appears in the set.
 */
export function frequencyOf<T = number>(
  searchElement: T,
  ...items: ItemList<T>
) {
  let count = 0;
  for (let item of items.flat() as T[]) count += +(item === searchElement);

  return count;
}

/**
 * Finds the elements in a set that occur the most.
 * @param items The set to look in.
 * @returns The mode of the set.
 */
export function modes<T = number>(...items: ItemList<T>) {
  let entries = frequency(...items);
  let max = entries.sort(([, a], [, b]) => b - a)[0][1];
  let modes = entries.filter(([, count]) => count === max);

  return modes.map(([item]) => item);
}

/**
 * Finds the element in a set that occurs the most.
 * If multiple elements are present, picks the first one.
 * @param items The set to look in.
 * @returns The mode of the set.
 */
export function mode<T = number>(...items: ItemList<T>) {
  let entries = frequency(...items);
  return entries.sort(([, a], [, b]) => b - a)[0][0];
}

/**
 * Finds the average of numbers in a set.
 * @param items The set to look in.
 * @returns The mean of the numbers in the set.
 */
export function mean(...items: ItemList) {
  return sum(...items) / items.flat().length;
}

/**
 * Finds a specific percentile in a set.
 * @param percent The percentage to find. Must be between 0 and 1.
 * @param items The set to look in.
 * @returns The Nth percentile of the set.
 */
export function percentile(percent: number, ...items: ItemList) {
  let sorted = sort(...items);
  let index = percent * sorted.length;

  if (index === Math.floor(index)) return sorted[index];
  return (sorted[Math.floor(index)] + sorted[Math.ceil(index)]) / 2;
}

/**
 * Finds the middle number (50th percentile) in a set.
 * @param items The set to look in.
 * @returns The median of the set.
 */
export function median(...items: ItemList) {
  return percentile(0.5, ...items);
}

/**
 * Finds the first quartile (25th percentile) of a set.
 * @param items The set to look in.
 * @returns The first quartile of the set.
 */
export function firstQuartile(...items: ItemList) {
  return percentile(0.25, ...items);
}

/**
 * Finds the third quartile (75th percentile) of a set.
 * @param items The set to look in.
 * @returns The third quartile of the set.
 */
export function thirdQuartile(...items: ItemList) {
  return percentile(0.75, ...items);
}

/** Contains all quartile functions. */
export let Quartile = {
  q0: min,
  q1: firstQuartile,
  q2: median,
  q3: thirdQuartile,
  q4: max,
};

/**
 * Gets the lower half of the set.
 * @param includeMedian Whether to include the median if the set contains an odd number of elements.
 * @param items The set to look in.
 * @returns The lower half of the set.
 */
export function lower(includeMedian: boolean, ...items: ItemList) {
  let sorted = sort(...items);

  return sorted.slice(
    0,
    sorted.length / 2 + +(includeMedian && sorted.length % 2)
  );
}

/**
 * Gets the upper half of the set.
 * @param includeMedian Whether to include the median if the set contains an odd number of elements.
 * @param items The set to look in.
 * @returns The upper half of the set.
 */
export function upper(includeMedian: boolean, ...items: ItemList) {
  let sorted = sort(...items);

  return sorted.slice(
    sorted.length / 2 - +(includeMedian && sorted.length % 2) + 1
  );
}

/**
 * Gets the range between the third quartile and first quartile of the set.
 * @param items The set to look in.
 * @returns The IQR of the set.
 */
export function interQuartileRange(...items: ItemList) {
  return thirdQuartile(...items) - firstQuartile(...items);
}

/**
 * Gets the five-number summary of the set.
 * @param items The set to look in.
 * @returns A list containing the minimum value, first quartile, median, third quartile, and maximum value of the set.
 */
export function summary(
  ...items: ItemList
): [
  min: number,
  firstQuartile: number,
  median: number,
  thirdQuartile: number,
  max: number
] {
  return [
    min(...items),
    firstQuartile(...items),
    median(...items),
    thirdQuartile(...items),
    max(...items),
  ];
}

/**
 * Gets the variance of a set.
 * @param items The set to look in.
 * @returns The variance of the set.
 */
export function variance(...items: ItemList) {
  let avg = mean(...items);
  return mean(items.flat().map((e) => (e - avg) ** 2));
}

/**
 * Gets the standard deviation of a set.
 * @param items The set to look in.
 * @returns The standard deviation of the set.
 */
export function standardDeviation(...items: ItemList) {
  return Math.sqrt(variance(...items));
}

/**
 * Gets the mean absolute deviation of a set.
 * @param items The set to look in.
 * @returns The mean absolute deviation of the set.
 */
export function meanAbsoluteDeviation(...items: ItemList) {
  let avg = mean(...items);
  return mean(items.flat().map((e) => Math.abs(e - avg)));
}

/**
 * Gets the lower outliers in a set.
 * @param max To be considered an outlier, the value must be less than this number. If the value is `null` or `undefined`, Q1 - 1.5 * IQR is used.
 * @param items The set to look in.
 * @returns A list of lower outliers.
 */
export function lowerOutliers(
  max: number | null | undefined = undefined,
  ...items: ItemList
) {
  if (typeof max != "number")
    max = firstQuartile(...items) - 1.5 * interQuartileRange(...items);

  return items.flat().filter((e) => e < (max as number));
}

/**
 * Gets the upper outliers in a set.
 * @param min To be considered an outlier, the value must be more than this number. If the value is `null` or `undefined`, Q3 + 1.5 * IQR is used.
 * @param items The set to look in.
 * @returns A list of upper outliers.
 */
export function upperOutliers(min: number | null = null, ...items: ItemList) {
  if (typeof min != "number")
    min = thirdQuartile(...items) + 1.5 * interQuartileRange(...items);

  return items.flat().filter((e) => e > (min as number));
}

/**
 * Gets all outliers in a set.
 * @param min To be considered an outlier, the value must be less than this number or more than {@linkcode max}. If the value is `null` or `undefined`, Q1 - 1.5 * IQR is used.
 * @param max To be considered an outlier, the value must be more than this number or less than {@linkcode min}. If the value is `null` or `undefined`, Q3 + 1.5 * IQR is used.
 * @param items The set to look in.
 * @returns A list of outliers.
 */
export function outliers(
  min: number | null = null,
  max: number | null = null,
  ...items: ItemList
) {
  if (typeof min != "number")
    min = thirdQuartile(...items) + 1.5 * interQuartileRange(...items);

  return items.flat().filter((e) => e > (min as number));
}

/**
 * Finds all unique items in the set.
 * @param items The set to look in.
 * @returns A list of unique items in the set.
 */
export function unique<T = number>(...items: ItemList<T>) {
  return [...new Set(items.flat())] as T[];
}

/** An array of either `T` or arrays of `T`. May be recursive. */
export type FlattableArrayOf<T> = readonly (T | FlattableArrayOf<T>)[];

/**
 * Flattens `items` into a single array.
 * @param items The set to look in.
 * @returns `items` flattened to a single array.
 */
export function flatten<T>(...items: FlattableArrayOf<T>): T[] {
  return items.flat(Infinity);
}

/**
 * Finds elements in `items` that are within the inclusive range [min, max].
 * @param min The minimum value to allow.
 * @param max The maximum value to allow.
 * @param items The set to look in.
 * @returns A list of items that are within the range.
 */
export function within(min = -Infinity, max = Infinity, ...items: ItemList) {
  return items.flat().filter((e) => e >= min && e <= max);
}

/**
 * Forces elements in `items` to be within the inclusive range [min, max].
 * @param min The minimum value to allow.
 * @param max The maximum value to allow.
 * @param items The set to look in.
 * @returns A list of items that are within the range.
 */
export function force(min = -Infinity, max = Infinity, ...items: ItemList) {
  return items.flat().map((e) => (e < min ? min : e > max ? max : e));
}
