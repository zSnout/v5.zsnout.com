import server from "..";

server.io.on("connection", (socket) => {
  socket.on("zcall:join", (roomID, userID) => {
    let room = `zcall:${roomID}`;
    socket.join(room);
    socket.to(room).emit("zcall:join", roomID, userID);
  });
});

declare global {
  interface IOEvents {
    "zcall:join"(roomID: string, userID: string): void;
  }
}
