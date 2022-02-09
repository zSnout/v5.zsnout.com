import "./preload.js";
import "https://unpkg.com/metaballs-js@2.0.0/dist/index.js";
import { getTheme, ThemeColor } from "../assets/js/util.js";

let bg = getTheme(ThemeColor.BackgroundColor).trim();
let text = getTheme(ThemeColor.TextColor).trim();
if (bg.length == 4) bg += bg.slice(1);
if (text.length == 4) text += text.slice(1);

let initMetaballs = (window as any).module.exports;
initMetaballs("#canvas", {
  backgroundColor: bg,
  color: text,
  minRadius: 2,
  maxRadius: 5,
  numMetaballs: 75,
  speed: 10,
  interactive: "canvas",
});
