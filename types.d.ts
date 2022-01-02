declare module "markdown-it-meta";

// We don't use @types/mathjax because it doesn't support the server-side version of MathJax.
declare module "mathjax" {
  export function init(arg: any): Promise<any>;
}

declare namespace AceAjax {
  export interface Ace {
    define(
      name: string,
      deps: string[],
      callback: (...deps: any[]) => any
    ): void;
  }
}

declare var Chessboard: typeof import("chessboardjs").ChessBoard;
declare var Quill: typeof import("quill").Quill;
