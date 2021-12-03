import server from "..";

server.decorate("redirect", (path: string, redirectTo: string) => {
  server.get(path, (req, res) => {
    res.redirect(redirectTo);
  });
});

declare module "fastify" {
  interface FastifyInstance {
    /**
     * Redirects a path to another URL.
     * @param path The path to capture.
     * @param redirectTo The URL to redirect to.
     */
    redirect(path: string, redirectTo: string): void;
  }
}
