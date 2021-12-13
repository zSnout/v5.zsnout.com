import glob = require("fast-glob");
import { existsSync } from "fs";
import { writeFile, watch as fsWatch, readFile, mkdir } from "fs/promises";
import { dirname, basename, join } from "path";
import { minify } from "uglify-js";

/**
 * Minifies JS files and resaves them along with a sourcemap.
 * @param file The path to the file that will be built.
 * @returns A promise resolving once the operation is completed.
 */
export async function buildFile(file: string) {
  try {
    if (!file.endsWith(".js")) throw new Error(`${file} is not a JS file.`);

    let sourcemap = JSON.parse(await readFile(file + ".map", "utf8"));
    let javascript = await readFile(file, "utf8");

    let minified = minify(javascript, {
      sourceMap: {
        content: {
          ...sourcemap,
          sources: [basename(file).replace(".js", ".ts")],
        },
        url: basename(file) + ".map",
      },
    });
    if (minified.error) throw minified.error;

    let outPath = file.replace(".client", "client");
    if (!existsSync(dirname(outPath)))
      await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, minified.code);
    await writeFile(outPath + ".map", minified.map);
  } catch (err) {
    log.failure("js", err);
  }
}

/**
 * Minifies all JS files in a directory and resaves them along with sourcemaps.
 * @param dir The path to the directory that will be built.
 * @returns A promise resolving once the operation is completed.
 */
export async function buildDir(dir: string) {
  let files = await glob(join(dir, "/**/*.js"));

  await Promise.all(files.map(buildFile));
  log("js", "built directory");
}

/**
 * Watches a directory for changes and minifies JS files in it along with sourcemaps.
 * @param dir The path to the directory that will be watched.
 * @returns A promise resolving once the operation is completed.
 */
export async function watchDir(dir: string) {
  await buildDir(dir);
  log("js", "watching for changes");

  /**
   * Because we need to make sure that both the source and the source map have been compiled, we wait 1 second before compiling. We need a way to make sure that we don't recompile when it's unnecessary. To do this, we store a cache of the last time a file was changed. If the file index hasn't changed, we compile using UglifyJS. Otherwise, we cancel the compilation and assume that a future `setTimeout` will compile the file.
   *
   * TL;DR: This object helps prevent unnecessary compilations. */
  let cache: { [file: string]: number } = {};

  for await (let { filename } of fsWatch(dir, { recursive: true })) {
    if (!filename.includes("node_modules") && filename.endsWith(".js")) {
      let time = Date.now();
      cache[filename] = time;

      setTimeout(() => {
        try {
          if (cache[filename] == time) buildFile(join(dir, filename));
        } catch {}
      });
    }
  }
}
