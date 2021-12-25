import { edit } from "../../assets/js/ace.js";
import $ from "../../assets/js/jsx.js";
import {
  decodeBase64,
  encodeBase64,
  getLocationHash,
  setLocationHash,
} from "../../assets/js/util.js";

function onchange() {
  if (viewer.contentWindow)
    viewer.contentWindow.location.hash = encodeBase64(editor.getValue());

  setLocationHash(encodeBase64(editor.getValue()));
}

$("#editor").text(
  decodeBase64(getLocationHash()) ||
    '"Hello world!"\ndef @myfunc $param\n  # pass'
);

let editor = edit("editor");
editor.session.setMode("ace/mode/storymatic");

let viewer = $("#viewer")[0] as HTMLIFrameElement;

onchange();
editor.session.on("change", onchange);

$("#icon-open").on("click", () => {
  open("/storymatic/viewer/#" + encodeBase64(editor.getValue()), "_blank");
});
