import fetch from "../../assets/js/fetch.js";
import $, { jsx } from "../../assets/js/jsx.js";

let centered = $(".centered");
let subheader = $(".subheader");
let session = new URL(location.href).searchParams.get("session");

if (!session) {
  subheader.text("Uh oh, we're missing your verification code!");
  centered.append(
    <p style={{ fontSize: "1rem" }}>
      You probably went to the wrong URL by accident (darn browser
      autocomplete!). <br /> You can go <a href="/">home</a> or to the{" "}
      <a href="/account/login/">login page</a> from here. <br /> If you were
      actually verifying an account, double-check your inbox. Thanks!
    </p>
  );
} else {
  Promise.all([
    fetch(
      "/api/account-verify/",
      "POST",
      { error: "boolean", message: "string" },
      { session }
    ),
    new Promise((res) => setTimeout(res, 1000)),
  ]).then(([result]) => {
    let p = (<p />).text(result.ok ? result.data.message : result.error);
    p.html(
      p.html().replace("#LOGINURL#", '<a href="/account/login/">this page</a>')
    );

    centered.append(p);
    $(".centered a").css("whiteSpace", "pre");
  });
}
