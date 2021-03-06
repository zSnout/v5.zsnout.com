import server from "..";

server
  .listen(process.env.PORT || 3000, process.env.ADDRESS || "127.0.0.1")
  .then(() => log("server", "started listening for requests"));

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** The port to serve the site on. */
      PORT?: string;

      /** The address to serve the site on. */
      ADDRESS?: string;
    }
  }
}
