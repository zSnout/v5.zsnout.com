import fastifyStatic from "fastify-static";
import { ServerResponse } from "http";
import { join } from "path";
import server from "..";

let csp = `default-src 'self'
  connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com/
  style-src 'self' https://fonts.googleapis.com
  font-src 'self' https://fonts.gstatic.com/
  object-src 'none'
  base-uri 'none'
  report-uri /csp`.replaceAll("\n", "; ");

server.addHook("preHandler", (req, res, next) => {
  res.header("content-security-policy", csp);

  next();
});

server.register(fastifyStatic, {
  root: join(__dirname, "../../client"),
  setHeaders(res: ServerResponse, path: string) {
    if (path.substring(path.length - 3) == ".ts")
      res.setHeader("content-type", "text/typescript");
    else if (path.substring(path.length - 4) == ".ejs")
      res.setHeader("content-type", "text/html");
  },
});
