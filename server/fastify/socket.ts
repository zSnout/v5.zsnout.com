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
