declare namespace AceAjax {
  export interface Ace {
    define(
      name: string,
      deps: string[],
      callback: (...deps: any[]) => any
    ): void;
  }
}

/** A list of all client-side Socket.IO events. */
declare interface IOEvents {}

/** A list of all server-side Socket.IO events. */
declare interface IOServerEvents {}

// Add more accurate Object.entries typings
declare interface ObjectConstructor {
  fromEntries<K extends string, V>(
    entries: Iterable<readonly [K, V]>
  ): { [X in K]: V };

  entries<K extends string, V>(obj: { [X in K]: V }): [K, V][];
}

// Add more accurate String typings
declare interface String {
  startsWith<S extends string>(
    searchString: S,
    position?: number
  ): this is `${S}${string}`;

  endsWith<S extends string>(
    searchString: S,
    position?: number
  ): this is `${string}${S}`;

  toLowerCase<S extends string>(this: S): Lowercase<S>;
  toUpperCase<S extends string>(this: S): Uppercase<S>;
}

declare var Chessboard: typeof import("chessboardjs").ChessBoard;
declare var Quill: typeof import("quill").Quill;
declare var png: typeof import("pngjs");
declare var io: (
  ...args: Partial<Parameters<typeof import("socket.io-client").io>>
) => import("socket.io-client").Socket<IOEvents, IOEvents>;
declare var jdenticon: typeof import("jdenticon");
