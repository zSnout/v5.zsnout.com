import type { Square } from "chess.js";
import type { Piece } from "chessboardjs";
import Chess from "../chessjs.js";
import $ from "../../assets/js/jsx.js";
import { addResizeProcess } from "../index.js";

/** The socket connected to the chess server. */
let socket = io();

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
  if (game.game_over() || game.turn() != piece[0]) {
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
  board.position(game.fen());
  setPageTitle();

  $("#board").removeClass("game-over", "b-check", "w-check");
  if (game.game_over()) $("#board").addClass("game-over");
  if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);

  socket.emit("chess:data", game.fen());
}

/** Sets the page title based on game status. */
function setPageTitle() {
  let turn: "White" | "Black" = game.turn() == "w" ? "White" : "Black";
  let other: "White" | "Black" = turn == "White" ? "Black" : "White";

  if (game.in_checkmate())
    document.title = `Chess - ${myCode} - ${other} Wins!`;
  else if (game.in_check())
    document.title = `Chess - ${myCode} - ${turn} in Check`;
  else if (game.in_stalemate())
    document.title = `Chess - ${myCode} - Stalemate`;
  else if (game.in_threefold_repetition())
    document.title = `Chess - ${myCode} - Draw by Repitition`;
  else if (game.insufficient_material())
    document.title = `Chess - ${myCode} - Draw by Insufficient Material`;
  else if (game.in_draw())
    document.title = `Chess - ${myCode} - Draw by 50-Move Rule`;
  else document.title = `Chess - ${myCode} - ${turn} to Move`;
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

let myCode = Math.floor(Math.random() * 899999) + 100000;

addResizeProcess(board);
setPageTitle();
if (game.game_over()) $("#board").addClass("game-over");
if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);

$("#icon-restart").on("click", () => {
  myCode = Math.floor(Math.random() * 899999) + 100000;

  game.reset();
  board.position(game.fen());
  $("#board").removeClass("game-over", "w-check", "b-check");
  setPageTitle();
});

$("#icon-pin").on("click", () => {
  let pinText = prompt("Please enter your PIN:", myCode.toString());
  if (!pinText || !+pinText) return;

  let pin = +pinText;
  if (Number.isNaN(pin) || myCode == pin) return;
  if (!String(pin).match(/^\d{6}$/)) return;

  myCode = pin;
  $("#board").removeClass("game-over", "w-check", "b-check");
  setPageTitle();

  socket.emit("chess:join", myCode);
});

socket.on("chess:request", () => socket.emit("chess:data", game.fen()));

socket.on("chess:data", (fen) => {
  game.load(fen);
  board.position(game.fen());
  $("#board").removeClass("game-over", "w-check", "b-check");
  if (game.game_over()) $("#board").addClass("game-over");
  if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);
  setPageTitle();
});

socket.on("connect", () => {
  socket.emit("chess:join", myCode);
});

// Prevents weird things on mobile
$("#board").on("touchmove", (event) => event.preventDefault());

declare global {
  interface IOEvents {
    "chess:join"(code: number): void;
    "chess:request"(): void;
    "chess:data"(fen: string): void;
  }
}
