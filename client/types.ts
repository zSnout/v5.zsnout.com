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
