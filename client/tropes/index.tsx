import $, { jsx } from "../assets/js/jsx.js";

/** The main editor. */
let editor = $("#editor");

/** The possible names for Torah tropes. */
type TropeNames = keyof typeof Tropes;

/** A list of Torah tropes. */
let Tropes = {
  Etnachta: "ב֑",
  SofPassuk: "סֽ",
  Segol: "ב֒",
  Shalshelet: "ב֓",
  ZakefKatan: "ב֔",
  ZakefGadol: "ב֕",
  Tifcha: "ב֖",
  Rivia: "ב֗",
  Zarka: "ב֮",
  Pashta: "ב֙",
  Yetiv: "ב֚",
  Tevir: "ב֛",
  Pazer: "ב֡",
  QarneFarah: "ב֟",
  TelishaGedola: "ב֠",
  Geresh: "ב֜",
  Gershayim: "ב֞",
  Mercha: "ב֥",
  Munach: "ב֣",
  Mahpach: "ב֤",
  Darga: "ב֧",
  Kadma: "ב֨",
  TelishaKetana: "ב֩",
  MerchaKefula: "ב֦",
  YerachBenYomo: "ב֪",
};

for (let [key, val] of Object.entries(Tropes)) {
  Tropes[key] = val[1];
}

/** A list of entries in Tropes. */
let tropes = Object.entries(Tropes);

/**
 * Finds the trope name of a word.
 * @param word The word to search in.
 * @returns The trope of the word.
 */
function tropeOf(word: string) {
  let lastIndex = -1;
  let lastName: TropeNames | `Munach${TropeNames}` | null = null;
  for (const [name, trope] of tropes) {
    if (word.indexOf(trope) > lastIndex) {
      lastIndex = word.indexOf(trope);
      lastName = name;
    }
  }

  return lastName;
}

$("#icon-recolor").on("click", () => {
  let html = (<p>{editor.text()}</p>).html();
  let words = html.split(/\s+|&amp;nbsp;/);
  let spans = words
    .map((word) => ({
      el: <span>{word}</span>,
      trope: tropeOf(word),
    }))
    .map(({ el, trope }, index, array) => {
      if (trope == "Munach" && array[index + 1].trope)
        return { el, trope: `Munach${array[index + 1].trope}` };
      else return { el, trope };
    })
    .map(({ el, trope }) => (trope ? el.addClass(trope) : el));

  console.log(spans);
  editor.empty();
  editor.append(...spans.map((e) => [e, " "]).flat());
});

$.main.on("click", ({ target }) => {
  if (target == $.main[0]) editor.focus();
});
