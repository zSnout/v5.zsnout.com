import $, { jsx } from "../../assets/js/jsx.js";
import {
  decodeBase64,
  getLocationHash,
  onLocationHashChange,
} from "../../assets/js/util.js";
import { createViewer } from "../viewer.js";

let field = $("#field");
let output = $("#output");
let form = $("#fieldform");
let element = $.main;
let viewer: ReturnType<typeof createViewer> | null = null;

if (top == window) field.focus();

/**
 * Starts a Storymatic program.
 * @param script The script to run.
 */
async function startProgram(script: string) {
  if (viewer) viewer.worker.kill();
}

onLocationHashChange((hash) => {
  let base64 = decodeBase64(hash);
  if (base64) startProgram(base64);
});

startProgram(decodeBase64(getLocationHash()) || "");
