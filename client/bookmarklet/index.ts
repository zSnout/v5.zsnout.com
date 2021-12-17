import { edit } from "../assets/js/ace.js";
import $ from "../assets/js/jsx.js";

let skipChange = false;

function onchange() {
  if (skipChange) return;

  $("#output").text(
    "javascript:" + encodeURI(`(()=>{${editor.getValue()}})();void 0`)
  );
}

let editor = edit("editor");
editor.session.setMode("ace/mode/javascript");

onchange();
editor.session.on("change", onchange);
