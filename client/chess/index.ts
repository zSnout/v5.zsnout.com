import type { ChessInstance, Square } from "chess.js";
import type { Piece } from "chessboardjs";
import "./preload.js";
import "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.12.0/chess.min.js";
import {
  decodeBase64,
  encodeBase64,
  getLocationHash,
  setLocationHash,
} from "../assets/js/util.js";
import $ from "../assets/js/jsx.js";

/** Removes move indicators from the board. */
function removeMoveIndicators() {
  $("#board .square-55d63").removeClass("move-indicator");
}

/**
 * Adds a move indicator to a square.
 * @param square The square to indicate.
 */
function addMoveIndicator(square: Square) {
  $(`#board .square-${square}`).addClass("move-indicator");
}

/**
 * Called when a piece is dragged.
 * @param source The source square.
 * @param piece The piece that's being dragged.
 * @returns A boolean indicating whether the piece is allowed to be dragged.
 */
function onDragStart(source: Square, piece: Piece) {
  if (
    game.game_over() ||
    (game.turn() == "w" && piece.search(/^b/) !== -1) ||
    (game.turn() == "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

/**
 * Checks if a move is valid.
 * @param source The source square.
 * @param target The target square.
 * @returns `snapback` if the move is invalid.
 */
function onDrop(source: Square, target: Square) {
  removeMoveIndicators();

  let move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });

  if (move === null) return "snapback";
}

/**
 * Highlights squares that a piece can move to. Called when the mouse hovers over a square.
 * @param square The square to highlight.
 */
function onMouseoverSquare(square: Square) {
  let moves = game.moves({
    square: square,
    verbose: true,
  });

  if (!moves.length) return;

  addMoveIndicator(square);
  for (let move of moves) {
    addMoveIndicator(move.to);
  }
}

/** Called when the mouse exits a square. */
function onMouseoutSquare() {
  removeMoveIndicators();
}

/** Called when a piece has finished snapping to the board. */
function onSnapEnd() {
  $("#board").removeClass("b-check", "w-check");
  board.position(game.fen());
  setLocationHash(encodeBase64(game.fen()));

  if (game.game_over()) $("#board").addClass("game-over");
  if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);
}

/** Resizes the visible board. */
function resize() {
  let el = $("#board");
  let size = Math.min($.main[0].clientWidth, $.main[0].clientHeight);

  el.css("width", `${size}px`);
  el.css("height", `${size}px`);
  board.resize();
}

let game: ChessInstance = exports.Chess(
  decodeBase64(getLocationHash() || "") || undefined
);

let board = Chessboard("board", {
  draggable: true,
  pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
  position: game.fen(),
  onDragStart: onDragStart as any,
  onDrop: onDrop as any,
  onMouseoverSquare: onMouseoverSquare as any,
  onMouseoutSquare: onMouseoutSquare as any,
  onSnapEnd: onSnapEnd as any,
});

resize();
window.addEventListener("resize", resize);

if (game.game_over()) $("#board").addClass("game-over");
if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);

$("#icon-restart").on("click", () => {
  game.reset();
  board.position(game.fen());
});
