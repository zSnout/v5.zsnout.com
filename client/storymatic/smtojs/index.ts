import { edit } from "../../assets/js/ace.js";
import { storyToJS } from "../lib.js";

let editor = edit("editor");
editor.session.setMode("ace/mode/storymatic");

let jsviewer = edit("jsviewer");
jsviewer.session.setMode("ace/mode/javascript");
jsviewer.setReadOnly(true);

editor.session.on("change", () => {
  setTimeout(() => jsviewer.session.setValue(storyToJS(editor.getValue())));
});
