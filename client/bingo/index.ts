import $ from "../assets/js/jsx.js";

function makeList() {
  return Array(15)
    .fill(0)
    .map((_, i) => i + 1)
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

let numbers = [0, 15, 30, 45, 60].map((e) => makeList().map((n) => n + e));

for (let i of [1, 2, 3, 4, 5])
  for (let j of [0, 1, 2, 3, 4])
    $(`#board button:nth-child(${5 * j + i + 5})`).text(
      numbers[i - 1][j].toString()
    );

$("#board button").on("click", (event) =>
  $(event.target).toggleClass("selected")
);
