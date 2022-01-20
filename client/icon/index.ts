import "https://unpkg.com/jdenticon@3.1.1/dist/jdenticon.min.js";
import $ from "../assets/js/jsx.js";

let icon = $("#icon");
let field = $("#field");

function replaceIcon() {
  let svg = jdenticon.toSvg(field.val(), 512, 0);
  icon.html(svg);
}

field.on("input", replaceIcon);
replaceIcon();
