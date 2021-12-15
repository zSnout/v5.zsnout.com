import { edit } from "../../assets/js/ace.js";

let editor = edit("editor");
editor.session.setMode("ace/mode/storymatic");

let jsviewer = edit("jsviewer");
editor.session.setMode("ace/mode/javascript");
