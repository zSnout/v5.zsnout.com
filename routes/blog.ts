import server from "../server";

server.capture(
  "/blog/:article/",
  "GET",
  { params: { article: "string" } },
  (req, res) => {
    if (!req.url.endsWith("/")) res.redirect(req.url + "/");
    else res.sendFile(`blog/${req.params.article}.html`);
  }
);
