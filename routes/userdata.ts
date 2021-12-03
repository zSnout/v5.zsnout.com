import server, { HTTPCode } from "../server";
import { getUsername } from "../server/systems/account";

server.capture(
  "/account/userdata/",
  "POST",
  {
    body: { session: "string" },
    reply: { error: "boolean", "username?": "string" },
  },
  async (req, res) => {
    let username = await getUsername(req.body.session);

    if (username) res.send({ error: false, username });
    else res.code(HTTPCode.Forbidden).send({ error: true });
  }
);
