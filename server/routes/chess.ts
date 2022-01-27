import server from "..";

server.io.on("connection", (socket) => {
  let last: string;

  socket.on("chess:join", (code) => {
    let room = `chess:${code}`;
    if (last) socket.leave(last);
    last = room;
    socket.join(room);

    socket.to(room).emit("chess:request");
    socket.on("chess:data", (fen) => socket.to(room).emit("chess:data", fen));
  });
});

declare global {
  interface IOEvents {
    "chess:join"(code: number): void;
    "chess:request"(): void;
    "chess:data"(fen: string): void;
  }
}
