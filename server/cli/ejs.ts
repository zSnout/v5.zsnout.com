import { Options, renderFile as ejsRenderFile, render as ejsRender } from "ejs";
import glob = require("fast-glob");
import { existsSync } from "fs";
import { writeFile, watch as fsWatch, readFile, mkdir } from "fs/promises";
import { dirname, join } from "path";

/** An object representing assets that will be added to an HTML page using `render`. */
interface Assets {
  /** A list of meta tags to include. */
  meta: [name: string, content: string][];

  /** A list of stylesheets to include. */
  styles: string[];

  /** A list of scripts to include. */
  scripts: string[];
}

/** An object representing options that can be passed to `render`. */
interface RenderOptions extends Assets {
  /** The body content of the webpage. */
  body: string;

  /** The title of the webpage. */
  title: string;

  /** Navigation icons that will go in the navbar. */
  icons: [title: string, href: string, icon: string][];
}

/** A list of assets that are included in built HTML files. */
let baseAssets: Assets = {
  meta: [],
  styles: ["/assets/css/index.css"],
  scripts: ["/assets/js/index.js"],
};

/**
 * Escapes special XML characters in a string.
 * @param text The text to escape.
 * @returns An escaped version of `text`.
 */
function xml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** The EJS options used by zSnout. */
export let ejsOptions: Options = { outputFunctionName: "echo" };

/**
 * Indents a string using a specified depth, ignoring the first line.
 * @param string The string to indent.
 * @param depth The number of spaces to indent.
 * @returns The indented string.
 */
function indent(string: string, depth = 2): string {
  return string.split("\n").join("\n" + " ".repeat(depth));
}

/**
 * Takes a list of assets and turns it into a list of HTML strings.
 * @param assets The assets. Contains `meta`, `styles`, and `scripts` keys.
 * @returns An array containing a string representing each asset in HTML.
 */
function makeAssetList(assets: Assets) {
  let meta = [...baseAssets.meta, ...assets.meta];
  let styles = [...baseAssets.styles, ...assets.styles];
  let scripts = [...baseAssets.scripts, ...assets.scripts];

  return [
    // prettier-ignore
    ...meta.map(([name, content]) => `<meta name="${xml(name)}" content="${xml(content)}" />`),
    ...styles.map((href) => `<link rel="stylesheet" href="${xml(href)}" />`),
    // prettier-ignore
    ...scripts.map((src) => `<script type="module" src="${xml(src)}"></script>`),
  ];
}

/**
 * Creates an icon element as a HTML string.
 * @param title The title of the icon.
 * @param href The href to go to when this icon is clicked.
 * @param icon The name of the icon to display. Must be in assets/icons.
 * @returns An HTML string representing the icon.
 */
function makeIcon(title: string, href: string, icon: string) {
  title = xml(title);
  href = xml(href);
  icon = xml(icon);

  return `<a href="${href}" title="${title}">
  <svg viewBox="2 2 20 20" width="18px" height="18px">
    <use href="/assets/icons/${icon}.svg#icon" />
  </svg>
</a>`;
}

/**
 * Minifies some HTML, making the assumption that it does not contain embedded CSS or JS.
 * Specifically, it minified streams of whitespace to a single space and changes `> <` to `><`.
 * @param content The content to minify.
 * @returns The minified content.
 */
function minifyHTML(content: string) {
  return content.replace(/\s+/g, " ").replace(/>\s+</g, "><");
}

/**
 * Renders an EJS template to HTML using specific data.
 * @param data The data to pass to the rendered function.
 * @returns A promise resolving to the rendered HTML.
 */
export async function render({ body, title, icons, ...assets }: RenderOptions) {
  return minifyHTML(
    await ejsRenderFile(
      join(__dirname, "../../layout.ejs"),
      {
        body,
        title,
        indent,
        buttons: icons.map(([title, href, icon]) =>
          makeIcon(title, href, icon)
        ),
        assets: makeAssetList(assets),
        xml,
      },
      ejsOptions
    )
  );
}

/**
 * Renders EJS content to HTML.
 * @param content The content to render.
 * @returns A promise resolving to the rendered HTML.
 */
export async function renderText(content: string) {
  let title: RenderOptions["title"] = "";
  let meta: RenderOptions["meta"] = [];
  let styles: RenderOptions["styles"] = [];
  let scripts: RenderOptions["scripts"] = [];
  let icons: RenderOptions["icons"] = [];

  try {
    let body = await ejsRender(
      content,
      {
        title: (name: string) => (title = name),
        meta: (name: string, content: string) => meta.push([name, content]),
        css: (href: string) => styles.push(href),
        js: (src: string) => scripts.push(src),
        nav: (title: string, href: string, icon: string) =>
          icons.push([title, href, icon]),
        desc: (description: string) => meta.push(["description", description]),
        indent,
        xml,
      },
      ejsOptions
    );

    let rendered = await render({ body, title, icons, meta, styles, scripts });
    return minifyHTML(rendered);
  } catch (err: any) {
    return `This page failed to render. Sorry!\n\n${err?.message || err}`;
  }
}

/**
 * Renders an EJS file to HTML.
 * @param file A path to the file to render.
 * @returns A promise resolving to the rendered HTML.
 */
export async function renderFile(file: string): Promise<string | null> {
  try {
    let content = await readFile(file, "utf8").catch(() => null);
    if (content === null) return null;

    return await renderText(content);
  } catch (err: any) {
    log.failure("ejs renderer", err);
    return null;
  }
}

/**
 * Builds an EJS file and saves it with a HTML extension.
 * @param file The path to the file that will be built.
 * @returns A promise resolving once the operation is completed.
 */
export async function buildFile(file: string) {
  if (!file.endsWith(".ejs")) throw new Error(`${file} is not an EJS file.`);

  let rendered = await renderFile(file);
  if (!rendered) return;

  let outPath = file.replace(".ejs", ".html");
  if (!existsSync(dirname(outPath)))
    await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, rendered);
}

/**
 * Builds all EJS files in a directory and saves them as HTML files.
 * @param dir The path to the directory that will be built.
 * @returns A promise resolving once the operation is completed.
 */
export async function buildDir(dir: string) {
  let files = await glob([join(dir, "/**/*.ejs"), "!node_modules/**"]);

  await Promise.all(files.map(buildFile));
  log("ejs", "built directory");
}

/**
 * Watches a directory for changes and builds EJS files in it.
 * @param dir The path to the directory that will be watched.
 * @returns A promise resolving once the operation is completed.
 */
export async function watchDir(dir: string) {
  await buildDir(dir);
  log("ejs", "watching for changes");

  for await (let { filename } of fsWatch(dir, { recursive: true })) {
    if (!filename.includes("node_modules") && filename.endsWith(".ejs")) {
      try {
        buildFile(join(dir, filename));
      } catch {}
    }
  }
}
