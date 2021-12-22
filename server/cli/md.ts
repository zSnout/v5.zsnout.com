import glob = require("fast-glob");
import { writeFile, watch as fsWatch, readFile, mkdir } from "fs/promises";
import MarkdownIt = require("markdown-it");
import meta = require("markdown-it-meta");
import MIAnchor from "markdown-it-anchor";
import { init } from "mathjax";
import { join, basename, dirname } from "path";
import { renderText } from "./ejs";
import { existsSync } from "fs";

let MathJax: any;
let onMathJaxLoaded = init({
  loader: { load: ["input/tex", "output/svg"] },
}).then((mj) => (MathJax = mj));

// I use a VSCode extension to generate TOCs when needed, so we try to match that extension's slugify function.
// https://github.com/yzhang-gh/vscode-markdown/blob/master/src/util/slugify.ts

/** A list of punctuators. */
let punctuators =
  /[\]\[\!\'\#\$\%\&\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\{\|\}\~\`。，、；：？！…—·ˉ¨‘’“”々～‖∶＂＇｀｜〃〔〕〈〉《》「」『』．〖〗【】（）［］｛｝]/g;

/** The main Markdown renderer. */
let renderer = new MarkdownIt({ html: true }).use(meta).use(MIAnchor, {
  slugify(str: string) {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(punctuators, "")
      .replace(/^\-+/, "")
      .replace(/\-+$/, "");
  },
});

/** Data describing a Markdown file. */
export interface MarkdownFileData {
  /** The original Markdown content. */
  markdown: string;

  /** The title of the document. */
  title: string;

  /** A description of the document. */
  desc: string;

  /** A rendered version of the Markdown content. */
  html: string;

  /** A list of JavaScript resources this page needs. */
  js: string[];

  /** A list of CSS resources this page needs. */
  css: string[];

  /** If set to `true` doesn't include 'assets/css/md.css' stylesheet. */
  renderOnly: boolean;
}

/** The YAML front-matter of a document. */
export interface MarkdownMeta {
  /** The title of the document. */
  title?: string;

  /** A description of the document. */
  desc?: string;

  /** JavaScript resources this page needs. */
  js?: string | string[];

  /** CSS resources this page needs. */
  css?: string | string[];

  /** If set to `true` doesn't include 'assets/css/md.css' stylesheet. */
  renderOnly?: boolean;
}

/**
 * Gets data about a Markdown file.
 * @param file The file to read.
 * @returns A promise resolving with a MarkdownFileData object.
 */
export async function getRawData(
  file: string
): Promise<MarkdownFileData | null> {
  if (!file.endsWith(".md")) throw new Error(`${file} is not a Markdown file.`);

  await onMathJaxLoaded;

  let markdown = await readFile(file, "utf8").catch(() => null);
  if (markdown === null) return null;

  try {
    // All Markdown-LaTeX packages we've tested can't parse block LaTeX, so we make our own implementation using MathJax and regexes.
    markdown = markdown.replaceAll(/(?<!\\)(\${1,2})([^$]+?)\1/g, (match) =>
      match.replace(/[\\`*_{}[\]()#+.!-]/g, "\\$&")
    );

    let html = renderer
      .render(markdown)
      .replace(/<p>\\(\w+)doc<\/p>/, "#$1#")
      .replace(
        /<p>\\(\w+)<\/p>([\s\S]+?)(?=<p>\\(\w+)<\/p>|<h. |<h.>|$)/g,
        '<div class="$1">$2</div>\n'
      )
      .replace(/<p>\\(\w+)\s/g, '<p class="$1">');

    let meta = ((renderer as any)?.meta || {}) as MarkdownMeta;

    let title =
      meta.title || markdown.match(/^# (.*)$/m)?.[1] || basename(file, ".md");
    let desc = meta.desc || markdown.match(/^([^#-<\\\s].+)$/m)?.[1] || "";

    let js = meta.js || [];
    js = typeof js == "string" ? [js] : js;

    let css = meta.css || [];
    css = typeof css == "string" ? [css] : css;

    html = html
      .replaceAll(/<p>\s*\$\$([^$]+)\$\$\s*<\/p>/g, (_, latex) => {
        let svg = MathJax.tex2svg(unescapeXML(latex), { display: true });
        let html = prune(MathJax.startup.adaptor.outerHTML(svg));
        return `<div class="center">${html}</div>`;
      })
      .replaceAll(/(?<!\\)\$([^$]+)\$/g, (_, latex) => {
        let svg = MathJax.tex2svg(unescapeXML(latex), { display: true });
        return prune(MathJax.startup.adaptor.outerHTML(svg));
      });

    html = pruneIDs(html);

    return {
      markdown,
      title,
      desc,
      html,
      js,
      css,
      renderOnly: meta.renderOnly || false,
    };
  } catch {
    return null;
  }
}

/**
 * Escapes certain JS characters in a string into backslash-prefixed equivalents.
 * @param str The string to escape.
 * @returns An escaped string.
 */
export function escapeJS(str: string): string {
  return str
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("'", "\\'")
    .replaceAll("\n", "\\n");
}

/**
 * Unescapes certain XML characters in some XML content.
 * @param xml The string to unescape.
 * @returns An escaped string.
 */
export function unescapeXML(xml: string): string {
  return xml
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"');
}

/**
 * Prunes some MJX content.
 * @param mjx The content to prune.
 * @returns A slightly minified version of the content.
 */
export function prune(mjx: string): string {
  return mjx
    .replaceAll(/data-[\w-]+="[^"]+"/g, "")
    .replaceAll(/<mjx-container [^>]+>/g, "")
    .replaceAll("</mjx-container>", "")
    .replaceAll("xlink:", "")
    .replaceAll("<g >", "<g>");
}

/**
 * Changes IDs in MJX content to make them shorter.
 * @param xml The content to filter.
 * @returns Shortened content.
 */
export function pruneIDs(xml: string): string {
  let id = 0;

  let matches = xml.match(/(?<=#|id=")MJX-[\w\d-]+/g);
  if (!matches) return xml;

  for (let match of matches)
    xml = xml.replaceAll(match, `mjx${(id++).toString()}`);

  return xml;
}

/**
 * Builds a MD file and saves it with a HTML extension.
 * @param file The path to the file that will be built.
 * @returns A promise resolving once the operation is completed.
 */
export async function buildFile(file: string): Promise<void> {
  if (!file.endsWith(".md")) throw new Error(`${file} is not a Markdown file.`);

  let rawData = await getRawData(file);
  if (!rawData) return;

  let {
    title: pretitle,
    desc: predesc,
    html: body,
    css,
    js,
    renderOnly,
  } = rawData;

  if (!renderOnly) css.push("/assets/css/md.css");

  let title = escapeJS(pretitle);
  let desc = escapeJS(predesc);

  let cssList = css
    .map(escapeJS)
    .map((asset) => `css("${asset}")`)
    .join(", ");

  let jsList = js
    .map(escapeJS)
    .map((asset) => `js("${asset}")`)
    .join(", ");

  body = `<div class="markdown">${body}</div>`.replace(
    /^<div class="markdown">\s*#(\w+)#/,
    '<div class="markdown $1">'
  );

  body = `<% ${cssList}; ${jsList}; title("${title}"); desc("${desc}") %>${body}`;

  let outPath = file.replace(".md", ".html");
  if (!existsSync(dirname(outPath)))
    await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, await renderText(body));
}

/**
 * Builds all MD files in a directory and saves them as HTML files.
 * @param dir The path to the directory that will be built.
 * @returns A promise resolving once the operation is completed.
 */
export async function buildDir(dir: string) {
  let files = await glob(join(dir, "/**/*.md"));

  await Promise.all(files.map(buildFile));
  log("md", "built directory");
}

/**
 * Watches a directory for changes and builds MD files in it.
 * @param dir The path to the directory that will be watched.
 * @returns A promise resolving once the operation is completed.
 */
export async function watchDir(dir: string) {
  await buildDir(dir);
  log("md", "watching for changes");

  for await (let { filename } of fsWatch(dir, { recursive: true })) {
    if (!filename.includes("node_modules") && filename.endsWith(".md")) {
      try {
        buildFile(join(dir, filename));
      } catch {}
    }
  }
}
