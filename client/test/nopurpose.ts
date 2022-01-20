/**
 * Finds long streaks of characters in a string.
 * @param text The text to check.
 * @returns A list of each character and its maximum streak.
 */
export function streaksOf(text: string) {
  let obj: { [key: string]: number } = {};

  (text.match(/(.)\1*/g) || [])
    .map((e) => [e[0], e.length] as const)
    .map(([key, value]) => (obj[key] = Math.max(obj[key] || 0, value)));

  return obj;
}

/**
 * Generates a bunch of text.
 * @param len The length of the string to generate.
 * @param chars The characters to use.
 * @returns A randomized string.
 */
export function genText(len: number, chars: string[]) {
  return Array.from(
    { length: len },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

/**
 * Generates a bunch of text that has a specific streak length.
 * @param len The length of the string to generate.
 * @param streakLen The length of the streak to generate.
 * @param chars The characters to use.
 * @param maxIter The maximum number of iterations to run.
 * @returns A randomized string.
 */
export function genUntilStreakOf(
  len: number,
  streakLen: number,
  chars: string[],
  maxIter = 1000
) {
  let i = 0;
  while (++i < maxIter) {
    let text = genText(len, chars);
    let streaks = streaksOf(text);
    let sorted = Object.entries(streaks).sort((a, b) => b[1] - a[1]);
    if (sorted[0][1] >= streakLen && sorted[1][1] >= streakLen) return text;
  }

  return "";
}
