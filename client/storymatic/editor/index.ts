import { edit } from "../../assets/js/ace.js";
import $ from "../../assets/js/jsx.js";

let skipChange = false;

function onchange() {
  viewer.contentWindow?.postMessage({ code: editor.getValue() });
  if (skipChange) return;
  localStorage.smToJS = editor.getValue();
}

window.addEventListener("storage", (ev) => {
  if (ev.key == "smToJS" && ev.newValue) {
    skipChange = true;
    editor.session.setValue(ev.newValue);
    skipChange = false;
  }
});

let editor = edit("editor");
editor.session.setMode("ace/mode/storymatic");

let viewer = $("#viewer")[0] as HTMLIFrameElement;

localStorage.smToJS =
  localStorage.smToJS || `"Hello world!"\ndef @myfunc $param\n  # pass`;

editor.session.setValue(localStorage.smToJS);
onchange();

editor.session.on("change", onchange);

declare global {
  interface Storage {
    /** The code in the Storymatic tester. */
    smToJS?: string;
  }
}