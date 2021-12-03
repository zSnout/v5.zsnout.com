import { Server } from "socket.io";
import server from "..";

server.decorate(
  "io",
  new Server<IOEvents, IOEvents, IOServerEvents>(server.server)
);

declare module "fastify" {
  interface FastifyInstance {
    /** The server's Socket.IO instance. */
    io: Server<IOEvents, IOEvents, IOServerEvents>;
  }
}

declare global {
  /** A list of all client-side Socket.IO events. */
  interface IOEvents {}

  /** A list of all server-side Socket.IO events. */
  interface IOServerEvents {}
}
