import server from "..";

server.io.on("connection", (socket) => {
  let myUserID: string; // Peer.JS ID, not Socket.IO ID
  let myRoomID: string; // Room ID

  socket.on("zcall:join", (roomID, userID) => {
    myUserID = userID;
    myRoomID = roomID;

    let room = `zcall:${roomID}`;
    socket.join(room);
    socket.to(room).emit("zcall:join", roomID, userID);
  });

  socket.on("disconnect", () => {
    socket.to(`zcall:${myRoomID}`).emit("zcall:leave", myUserID);
  });
});

declare global {
  interface IOEvents {
    "zcall:join"(roomID: string, userID: string): void;
    "zcall:leave"(userID: string): void;
  }
}
