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
declare var io: (
  ...args: Partial<Parameters<typeof import("socket.io-client").io>>
) => import("socket.io-client").Socket<IOEvents, IOEvents>;

/** A list of all client-side Socket.IO events. */
declare interface IOEvents {}

/** A list of all server-side Socket.IO events. */
declare interface IOServerEvents {}

// Add more accurate Object.entries typings
declare interface ObjectConstructor {
  entries<K extends string, V>(obj: { [X in K]: V }): [K, V][];
}

// Add more accurate String.prototype.startsWith & .endsWith typings
declare interface String {
  startsWith<S extends string>(
    searchString: S,
    position?: number
  ): this is `${S}${string}`;

  endsWith<S extends string>(
    searchString: S,
    position?: number
  ): this is `${string}${S}`;
}
