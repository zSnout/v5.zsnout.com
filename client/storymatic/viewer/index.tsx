import $ from "../../assets/js/jsx.js";
import {
  decodeBase64,
  getLocationHash,
  onLocationHashChange,
} from "../../assets/js/util.js";
import { createViewer, SMViewer } from "../viewer.js";

let field = $("#field");
let output = $("#output");
let form = $("#fieldform");
let element = $.main;
let viewer: SMViewer | null = null;

if (top == window) field.focus();

/**
 * Starts a Storymatic program.
 * @param script The script to run.
 */
async function startProgram(script: string) {
  if (viewer) viewer.thread.kill();
  viewer = createViewer(script, { field, output, form, element });
}

onLocationHashChange((hash) => {
  let base64 = decodeBase64(hash);
  if (base64) startProgram(base64);
});

startProgram(decodeBase64(getLocationHash()) || "");
