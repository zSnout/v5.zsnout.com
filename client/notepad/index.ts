import $ from "../assets/js/jsx.js";
import { getStorage, onStorageChange, setStorage } from "../assets/js/util.js";

let ignoreEvent = false;
let quill = new Quill("#editor", {
  theme: "bubble",
  placeholder: "Start writing; we'll save it as you go...",
  modules: {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      ["clean"],
    ],
  },
});

quill.on("text-change", (_delta, _oldContents, source) => {
  if (source != "user") return;

  ignoreEvent = true;
  setStorage("notepad:content", JSON.stringify(quill.getContents().ops));
});

declare global {
  interface StorageItems {
    "notepad:content"?: string;
  }
}

onStorageChange("notepad:content", (val) => {
  if (!val) return;
  if (ignoreEvent) return (ignoreEvent = false);

  try {
    quill.setContents(JSON.parse(val));
  } catch {}
});

let val = getStorage("notepad:content");
if (val) {
  try {
    quill.setContents(JSON.parse(val));
  } catch {}
}

$.main.on("click", ({ target }) => {
  if (target == $.main[0]) {
    quill.setSelection(quill.getLength(), 0);
    quill.focus();
  }
});
