import server from "..";

server.io.on("connection", (socket) => {
  socket.on("chess:data", (code, fen) =>
    server.io.emit("chess:data", code, fen)
  );
});

declare global {
  interface IOEvents {
    "chess:data"(code: number, fen: string): void;
  }
}
