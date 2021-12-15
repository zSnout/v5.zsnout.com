import { edit } from "../../assets/js/ace.js";
import { storyToJS } from "../lib.js";

function onchange() {
  jsviewer.session.setValue(storyToJS(editor.getValue()));
  localStorage.smToJS = editor.getValue();
}

window.addEventListener("storage", (ev) => {
  if (ev.key == "smToJS" && ev.newValue) editor.session.setValue(ev.newValue);
});

let editor = edit("editor");
editor.session.setMode("ace/mode/storymatic");

let jsviewer = edit("jsviewer");
jsviewer.session.setMode("ace/mode/javascript");
jsviewer.setReadOnly(true);

if (localStorage.smToJS) {
  editor.session.setValue(localStorage.smToJS);
  onchange();
}
editor.session.on("change", onchange);

declare global {
  interface Storage {
    /** The code in the Storymatic tester. */
    smToJS?: string;
  }
}
