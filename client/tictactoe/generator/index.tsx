import $, { jsx } from "../../assets/js/jsx.js";
import { bestBoards, approxBestBoards } from "./lib.js";

let boards = <div id="boards" />;

async function makeBoards(size: number) {
  if (
    !confirm(
      "This process may take a while and cause the browser to freeze. Continue?"
    )
  )
    return;

  $("#buttons").remove();
  let html = (await bestBoards(size)).join("");
  boards.html(html);

  $("#info").remove();
  boards.appendTo($.main);
}

async function approxBoards(size: number) {
  if (
    !confirm(
      "This process may take a while and cause the browser to freeze. Continue?"
    )
  )
    return;

  let num = +prompt(
    `How many iterations should we try? Maximum is ${2 ** (size ** 2)}.`
  )!;
  if (Number.isNaN(num)) return;

  $("#buttons").remove();
  let html = (await approxBestBoards(size, num)).join("");
  boards.html(html);

  $("#info").remove();
  boards.appendTo($.main);
}

$("#gen-4").on("click", () => makeBoards(4));
$("#gen-5").on("click", () => makeBoards(5));
$("#gen-6").on("click", () => makeBoards(6));
$("#gen-7").on("click", () => makeBoards(7));

$("#approx-4").on("click", () => approxBoards(4));
$("#approx-5").on("click", () => approxBoards(5));
$("#approx-6").on("click", () => approxBoards(6));
$("#approx-7").on("click", () => approxBoards(7));
