/** The ANSI color code for red. */
let r = "\x1B[31m";

/** The ANSI color code for green. */
let g = "\x1B[32m";

/** The ANSI color code for blue. */
let b = "\x1B[34m";

/** The ANSI code to reset colors. */
let w = "\x1B[39m";

/**
 * Converts data to a string and strips newlines.
 * @param data The data to convert.
 * @returns The data as a string.
 */
function strOf(data: any): string {
  try {
    data = data?.message ?? data;
    data = data?.toString?.() ?? data;

    return String(data)
      .replace(/[\n\r]+/g, "")
      .trim();
  } catch {
    return "";
  }
}

function log(name: string, data: any) {
  console.log(`[${b}${name}${w}]: ${strOf(data)}${w}`);
}
log.success = (name: string, data: any) => log(name, g + strOf(data));
log.failure = (name: string, data: any) => log(name, r + strOf(data));
global.log = log;

declare global {
  /**
   * Logs some data, along with a name.
   * @param name The "name" to associate with this log entry.
   * @param data The data to log.
   */
  function log(name: string, data: any): void;

  namespace log {
    /**
     * Logs some data in green, along with a name.
     * @param name The "name" to associate with this log entry.
     * @param data The data to log.
     */
    function success(name: string, data: any): void;

    /**
     * Logs some data in red, along with a name.
     * @param name The "name" to associate with this log entry.
     * @param data The data to log.
     */
    function failure(name: string, data: any): void;
  }
}

export {};
