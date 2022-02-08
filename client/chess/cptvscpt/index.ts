import $ from "../../assets/js/jsx.js";
import { shuffle } from "../../assets/js/util.js";
import Chess from "../chessjs.js";
import { addResizeProcess } from "../index.js";
import { setupUsingLocationHash } from "../position.js";

/** Makes the best move according to the engine. */
async function makeAIMove() {
  if (game.game_over()) return;

  let moves = game.moves({ verbose: true });
  if (!moves.length || game.game_over()) return;

  shuffle(moves).sort(({ captured: a }, { captured: b }) => {
    let ap = ["p", "n", "b", "r", "q", "k", undefined].indexOf(a);
    let bp = ["p", "n", "b", "r", "q", "k", undefined].indexOf(b);

    return ap - bp;
  });

  game.move(moves[0]);

  board.position(game.fen(), true);

  setPageTitle();
  $("#board").removeClass("game-over", "w-check", "b-check");
  if (game.game_over()) $("#board").addClass("game-over");
  if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);

  setTimeout(makeAIMove, 100);
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

let game = new Chess();

let board = Chessboard("board", {
  pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
  position: game.fen(),
});

addResizeProcess(board);
setPageTitle();
if (game.game_over()) $("#board").addClass("game-over");
if (game.in_check()) $("#board").addClass(`${game.turn()}-check`);

// Prevents weird things on mobile
$("#board").on("touchmove", (event) => event.preventDefault());

setupUsingLocationHash(game, board);
setTimeout(makeAIMove);
