import fetch from "../../assets/js/fetch.js";
import $, { jsx } from "../../assets/js/jsx.js";
import { setStorage } from "../../assets/js/util.js";

let username = $("#username");
let password = $("#password");

let label = $("#form label:last-child");
if (!label.length) label = <label />;

$("#form").on("submit", async (event) => {
  event.preventDefault();

  let [result] = await Promise.all([
    fetch(
      "/api/account-login/",
      "POST",
      {
        error: "boolean",
        message: "string",
        "session?": "string",
      },
      { username: username.val(), password: password.val() }
    ),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);

  label.appendTo("#form");
  label.text(result.ok ? result.data.message : result.error);

  if (result.ok && !result.data.error && result.data.session) {
    setStorage("options:authToken", result.data.session);
    location.href = "/";
  }
});

$("#sign-up").on("click", () => {
  location.href = "/account/create/";
});
