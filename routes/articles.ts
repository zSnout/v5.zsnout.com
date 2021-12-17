import server from "../server";

/**
 * Allows / to be appended to the end of paths in this folder.
 * For example, a user can request `/blog/article/` and get `/blog/article.html`.
 * @param path The folder to search in.
 */
function makeArticleList(path: string) {
  server.capture(
    `${path}/:article/`,
    "GET",
    { params: { article: "string" } },
    (req, res) => {
      if (!req.url.endsWith("/")) res.redirect(req.url + "/");
      else res.sendFile(`${path.slice(1)}/${req.params.article}.html`);
    }
  );
}

makeArticleList("/blog");
makeArticleList("/math");
makeArticleList("/storymatic/guide");
