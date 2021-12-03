import server from "../server";

server.capture(
  "/csp",
  "POST",
  {
    body: {
      "csp-report": {
        "document-uri": "string",
        "line-number?": "number",
        "source-file": "string",
        "violated-directive": "string",
      },
    },
  },
  async (req, res) => {
    res.send("thx for da report");
  },
  {
    onRequest(req, res, done) {
      if (req.headers["content-type"] == "application/csp-report")
        req.headers["content-type"] = "application/json";

      done();
    },
  }
);
