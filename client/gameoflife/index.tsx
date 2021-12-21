import $, { jsx } from "../assets/js/jsx.js";

/** The grid of cells. */
let grid = $("#grid");

/** The location hash split by semicolons. */
let split = window.location.hash.slice(1).split(";");

/** The maximum length a substring in {@linkcode split} has. */
let maxlen = Math.max(...split.map((e) => e.length));

/** An array of `false`s with a length of {@linkcode maxlen} */
let maxarr = Array<false>(maxlen).fill(false);

/** The board of cells. */
let board = split.map((e) =>
  e
    .split("")
    .map((e) => (e == "0" ? false : e == "1" ? true : null))
    .filter((e): e is boolean => e !== null)
    .concat(maxarr)
    .slice(0, maxlen)
);

/**
 * Creates a <span> element with an optional `filled` class.
 * @param obj The JSX attributes passed to this function.
 * @param obj.filled Whether this cell is filled.
 * @returns A <span> with a "filled" class if `filled` was specified.
 */
function BoardCell({ filled }: { filled: boolean }) {
  return <span className={filled ? "filled" : ""}></span>;
}

/**
 * Creates a <div> containing `BoardCell`s.
 * @param obj The JSX attributes passed to this function.
 * @param obj.cells The cells to create.
 * @returns A <div> contanining all cells as `BoardCell`s.
 */
function BoardRow({ cells }: { cells: boolean[] }) {
  return (
    <div>
      {cells.map((e) => (
        <BoardCell filled={e} />
      ))}
    </div>
  );
}

/** Outputs the board to `grid` as HTML. */
function outputBoard() {
  let rows = board.map((e) => <BoardRow cells={e} />);
  grid.empty().append(...rows);

  updateHash();
}

/** Whether the mouse is down. */
let isMouseDown = false;

/** The last target column. */
let lastTargetCol: number | null = null;

/** The last target row. */
let lastTargetRow: number | null = null;

/** The function called when a cell is clicked or hovered over. */
function onClick({ target, type }: MouseEvent & { target: HTMLElement }) {
  if (type == "mousedown") isMouseDown = true;

  if (type == "mouseup") {
    isMouseDown = false;
    lastTargetCol = null;
    lastTargetRow = null;
  }

  if (target.tagName == "SPAN" && isMouseDown) {
    let col = [...target.parentElement!.children].indexOf(target);
    let row = [...grid[0].children].indexOf(target.parentElement!);

    if (lastTargetCol === col && lastTargetRow == row) return;

    board[row][col] = !board[row][col];
    outputBoard();

    lastTargetCol = col;
    lastTargetRow = row;
  }
}

/** Updates the location hash. */
function updateHash() {
  window.location.hash = board
    .map((e, i) => {
      let nums = e.map(Number);
      let cutoff = i ? nums.lastIndexOf(1) + 1 : undefined;
      return nums.slice(0, cutoff).join("");
    })
    .join(";");
}

function at(i: number, j: number) {
  i = i + board.length;
  j = j + board[0].length;

  return board[i % board.length][j % board[0].length];
}

/** Steps through the animation. */
function step() {
  let il = board.length;
  let jl = board[0].length;
  let inner = Array.from<boolean>({ length: jl }).fill(false);

  // Have to spread to avoid passing by reference
  let next = Array.from({ length: il }, () => [...inner]);

  for (let i = 0; i < il; i++) {
    for (let j = 0; j < jl; j++) {
      let numAround = [
        at(i - 1, j - 1),
        at(i - 1, j + 1),
        at(i + 1, j - 1),
        at(i + 1, j + 1),
        at(i, j - 1),
        at(i, j + 1),
        at(i - 1, j),
        at(i + 1, j),
      ].reduce((a, b) => a + +b, 0);

      if (numAround == 3) next[i][j] = true;
      if (board[i][j] && numAround == 2) next[i][j] = true;
    }
  }

  board = next;
  outputBoard();
}

/** The ID of the current timer, or `null` if none exists. */
let timerID: number | null = null;

/** Plays the animation continously. */
function playpause() {
  if (timerID) {
    $("#icon-playpause use").attr("href", "/assets/icons/play.svg#icon");
    clearInterval(timerID);
    timerID = null;
  } else {
    $("#icon-playpause use").attr("href", "/assets/icons/pause.svg#icon");
    timerID = setInterval(step, 100) as any as number;
  }
}

$.root.on("mousedown", onClick);
$.root.on("mouseup", onClick);
grid.on("mousemove", onClick);

$("#icon-step").on("click", step);
$("#icon-playpause").on("click", playpause);

$("#icon-addrow").on("click", () => {
  board.push(Array(board[0].length).fill(false));
  outputBoard();
});

$("#icon-addcol").on("click", () => {
  board.map((e) => e.push(false));
  outputBoard();
});

$("#icon-minrow").on("click", () => {
  board.splice(board.length - 1, 1);
  outputBoard();
});

$("#icon-mincol").on("click", () => {
  board.map((e) => e.splice(e.length - 1, 1));
  outputBoard();
});

outputBoard();
