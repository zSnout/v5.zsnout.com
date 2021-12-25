import fetch from "../../assets/js/fetch.js";
import $, { jsx } from "../../assets/js/jsx.js";

let username = $("#username");
let password = $("#password");
let email = $("#email");

let label = $("#form label:last-child");
if (!label.length) label = <label />;

$("#form").on("submit", async (event) => {
  event.preventDefault();

  let result = await fetch(
    "/api/account-create/",
    "POST",
    {
      error: "boolean",
      message: "string",
    },
    { username: username.val(), password: password.val(), email: email.val() }
  );

  label.appendTo("#form");
  label.text(result.ok ? result.data.message : result.error);
});
