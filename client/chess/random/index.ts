import type { ChessInstance } from "chess.js";
import "./preload.js";
import "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.12.0/chess.min.js";
import { decodeBase64, getLocationHash } from "../../assets/js/util.js";
import $ from "../../assets/js/jsx.js";

/** Resizes the visible board. */
function resize() {
  let el = $("#board");
  let size = Math.min($.main[0].clientWidth, $.main[0].clientHeight);

  el.css("width", `${size}px`);
  el.css("height", `${size}px`);
  board.resize();
}

/** Makes a random move. */
function makeRandomMove() {
  let moves = game.moves();
  if (!moves.length || game.game_over()) return;

  let index = Math.floor(Math.random() * moves.length);
  game.move(moves[index]);
  board.position(game.fen(), false);

  setPageTitle();
  $("#board").removeClass("game-over", "w-check", "b-check");
  if (game.game_over()) $("#board").addClass("game-over");
  if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);

  setTimeout(makeRandomMove, 100);
}

/** Sets the page title based on game status. */
function setPageTitle() {
  let turn: "White" | "Black" = game.turn() == "w" ? "White" : "Black";
  let other: "White" | "Black" = turn == "White" ? "Black" : "White";

  if (game.in_checkmate()) document.title = `Chess - ${other} Wins!`;
  else if (game.in_check()) document.title = `Chess - ${turn} in Check`;
  else if (game.in_stalemate()) document.title = `Chess - Stalemate`;
  else if (game.in_threefold_repetition())
    document.title = `Chess - Draw by Repitition`;
  else if (game.insufficient_material())
    document.title = `Chess - Draw by Insufficient Material`;
  else if (game.in_draw()) document.title = `Chess - Draw by 50-Move Rule`;
  else document.title = `Chess - ${turn} to Move`;
}

let game: ChessInstance = exports.Chess(
  decodeBase64(getLocationHash() || "") || undefined
);

let board = Chessboard("board", {
  pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
  position: game.fen(),
});

resize();
window.addEventListener("resize", resize);

setPageTitle();
if (game.game_over()) $("#board").addClass("game-over");
if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);

$("#icon-restart").on("click", () => {
  game.reset();
  board.position(game.fen());
  $("#board").removeClass("game-over", "w-check", "b-check");
  setPageTitle();
});

// Prevents weird things on mobile
$("#board").on("touchmove", (event) => event.preventDefault());

setTimeout(makeRandomMove);
