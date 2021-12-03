import server from "../server";

let repo = "https://github.com/zsnout/zsnout.com";

server.redirect("/gh/", repo);
server.redirect("/gh/repo", repo);
server.redirect("/gh/contributors", `${repo}/graphs/contributors`);
server.redirect("/gh/zsakowitz", "https://github.com/zsakowitz");
server.redirect("/gh/zsnout", "https://github.com/zsnout");
