import { edit } from "../../assets/js/ace.js";
import {
  decodeBase64,
  encodeBase64,
  getLocationHash,
  setLocationHash,
} from "../../assets/js/util.js";
import { storyToJS } from "../lib.js";

let skipChange = false;

function onchange() {
  jsviewer.session.setValue(storyToJS(editor.getValue()));
  if (skipChange) return;
  setLocationHash(encodeBase64(editor.getValue()));
}

let editor = edit("editor");
editor.session.setMode("ace/mode/storymatic");

let jsviewer = edit("jsviewer");
jsviewer.session.setMode("ace/mode/javascript");
jsviewer.setReadOnly(true);

let initial =
  decodeBase64(getLocationHash()) ||
  '"Hello world!"\ndef @myfunc $param\n  # pass';

editor.session.setValue(initial);
onchange();

editor.session.on("change", onchange);
