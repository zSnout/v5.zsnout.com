import { edit } from "../../assets/js/ace.js";
import $ from "../../assets/js/jsx.js";

let skipChange = false;

function onchange() {
  if (viewer.contentWindow)
    viewer.contentWindow.location.hash = btoa(editor.getValue());

  window.location.hash = btoa(editor.getValue());

  if (skipChange) return;
}

let editor = edit("editor");
editor.session.setMode("ace/mode/storymatic");

let viewer = $("#viewer")[0] as HTMLIFrameElement;

editor.setValue(`"Hello world!"\ndef @myfunc $param\n  # pass`);

onchange();

editor.session.on("change", onchange);

declare global {
  interface Storage {
    /** The code in the Storymatic tester. */
    smToJS?: string;
  }
}

try {
  let hash = location.hash.slice(1);
  let script = atob(hash);

  editor.setValue(script);
} catch {}

addEventListener("hashchange", (event) => {
  if (window.location.hash == "#!open") {
    open("/storymatic/viewer/#" + btoa(editor.getValue()), "_blank");
    window.location.hash = btoa(editor.getValue());
  }
});
