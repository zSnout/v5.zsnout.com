import fastifyStatic from "fastify-static";
import { ServerResponse } from "http";
import { join } from "path";
import server from "..";

let csp = `default-src 'self'
  connect-src 'self' blob: https://chessboardjs.com/ https://fonts.googleapis.com/ https://fonts.gstatic.com/ https://cdnjs.cloudflare.com/ https://unpkg.com/ https://raw.githubusercontent.com/ https://0.peerjs.com/ wss://0.peerjs.com/
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com/ https://fonts.googleapis.com/
  script-src 'self' https://cdnjs.cloudflare.com/ https://unpkg.com/
  img-src 'self' data: blob: https://chessboardjs.com/
  font-src 'self' https://fonts.gstatic.com/
  object-src 'none'
  worker-src 'self' blob: https://unpkg.com/
  base-uri 'none'
  report-uri /csp`.replaceAll("\n", "; ");

server.addHook("preHandler", (_, res, next) => {
  res.header("content-security-policy", csp);
  next();
});

server.register(fastifyStatic, {
  root: join(__dirname, "../../client"),
  setHeaders(res: ServerResponse, path: string) {
    if (
      path.substring(path.length - 3) == ".ts" ||
      path.substring(path.length - 3) == ".tsx"
    )
      res.setHeader("content-type", "text/typescript");
    else if (path.substring(path.length - 4) == ".ejs")
      res.setHeader("content-type", "text/ejs");
  },
});
