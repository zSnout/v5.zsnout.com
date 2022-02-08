import type { Square } from "chess.js";
import type { Piece } from "chessboardjs";
import $ from "../../assets/js/jsx.js";
import Chess from "../chessjs.js";
import { bestMove } from "../engine.js";
import { addResizeProcess } from "../index.js";
import { setupUsingLocationHash } from "../position.js";

/** The turn that the AI takes. */
let aiTurn: "w" | "b" = Math.random() < 0.5 ? "w" : "b";

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
  if (game.game_over() || game.turn() != piece[0] || game.turn() == aiTurn) {
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
  let fen = `${board.fen()} ${game.turn() == "b" ? "w" : "b"} - - 0 1`;
  game.load(fen);
  setPageTitle();

  $("#board").removeClass("game-over", "b-check", "w-check");
  if (game.game_over()) $("#board").addClass("game-over");
  if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);
  if (game.turn() == aiTurn) setTimeout(makeAIMove);
}

/** Makes the best possible AI move. */
async function makeAIMove() {
  if (game.game_over()) return;

  let move = await bestMove(game);
  if (!move) return;

  game.move(move);
  board.position(game.fen(), true);

  setPageTitle();
  $("#board").removeClass("game-over", "w-check", "b-check");
  if (game.game_over()) $("#board").addClass("game-over");
  if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);
}

/** Sets the page title based on game status. */
function setPageTitle() {
  let turn: "White" | "Black" | "AI" = game.turn() == "w" ? "White" : "Black";
  let other: "White" | "Black" | "AI" = turn == "White" ? "Black" : "White";

  if (game.turn() == aiTurn) turn = "AI";
  else other = "AI";

  if (game.in_checkmate()) document.title = `Illegal Chess - ${other} Wins!`;
  else if (game.in_check()) document.title = `Illegal Chess - ${turn} in Check`;
  else if (game.in_stalemate()) document.title = `Illegal Chess - Stalemate`;
  else if (game.in_threefold_repetition())
    document.title = `Illegal Chess - Draw by Repitition`;
  else if (game.insufficient_material())
    document.title = `Illegal Chess - Draw by Insufficient Material`;
  else if (game.in_draw())
    document.title = `Illegal Chess - Draw by 50-Move Rule`;
  else document.title = `Illegal Chess - ${turn} to Move`;
}

let game = new Chess();

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

addResizeProcess(board);
setPageTitle();
if (game.game_over()) $("#board").addClass("game-over");
if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);

// Prevents weird things on mobile
$("#board").on("touchmove", (event) => event.preventDefault());

setupUsingLocationHash(game, board);
board.orientation(aiTurn == "w" ? "black" : "white");
if (game.turn() == aiTurn) setTimeout(makeAIMove);
