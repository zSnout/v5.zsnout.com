import type { ChessBoardInstance } from "chessboardjs";
import $ from "../assets/js/jsx.js";

/**
 * Starts a resize process on the given ChessBoard.
 * @param board The ChessBoard instance.
 */
export function addResizeProcess(board: ChessBoardInstance) {
  /** Resizes the board. */
  function resize() {
    $.main.empty();
    let size = Math.min($.main.width(), $.main.height());
    boardEl.css("width", `${size}px`);
    boardEl.css("height", `${size}px`);

    $.main.append(boardEl);
    board.resize();
  }

  let boardEl = $("#board");
  window.addEventListener("resize", resize);
  resize();
}
