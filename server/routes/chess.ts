import server from "..";

server.io.on("connection", (socket) => {
  socket.on("chess:data", (code, fen) =>
    server.io.emit("chess:data", code, fen)
  );

  socket.on("chess:join", (code, id) => server.io.emit("chess:join", code, id));
});

declare global {
  interface IOEvents {
    "chess:join"(code: number, id: number): void;
    "chess:data"(code: number, fen: string): void;
  }
}
