import { edit } from "../../assets/js/ace.js";
import $ from "../../assets/js/jsx.js";

let skipChange = false;

function onchange() {
  if (viewer.contentWindow)
    viewer.contentWindow.location.hash = btoa(editor.getValue());

  window.location.hash = btoa(editor.getValue());

  if (skipChange) return;
}

$("#editor").text(`"Hello world!"\ndef @myfunc $param\n  # pass`);
try {
  let hash = location.hash.slice(1);
  let script = atob(hash);
  $("#editor").text(script);
} catch {}

let editor = edit("editor");
editor.session.setMode("ace/mode/storymatic");

let viewer = $("#viewer")[0] as HTMLIFrameElement;

onchange();
editor.session.on("change", onchange);

$("#icon-open").on("click", () => {
  open("/storymatic/viewer/#" + btoa(editor.getValue()), "_blank");
});