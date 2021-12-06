import server from "../server";

server.capture(
  "/math/:article/",
  "GET",
  { params: { article: "string" } },
  (req, res) => {
    if (!req.url.endsWith("/")) res.redirect(req.url + "/");
    else res.sendFile(`math/${req.params.article}.html`);
  }
);
