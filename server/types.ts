declare module "markdown-it-meta";

// We don't use @types/mathjax because it doesn't support the server-side version of MathJax.
declare module "mathjax" {
  export function init(arg: any): Promise<any>;
}

/** A list of all client-side Socket.IO events. */
declare interface IOEvents {}

/** A list of all server-side Socket.IO events. */
declare interface IOServerEvents {}
