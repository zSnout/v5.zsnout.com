import server from "..";

server.setNotFoundHandler((req, res) => {
  if (!req.url.endsWith("/") && !req.url.includes("."))
    res.redirect(req.url + "/");
  else res.sendFile("/404/index.html");
});
