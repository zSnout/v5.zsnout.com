import { ChessInstance } from "chess.js";
import thread, { Thread } from "../assets/js/thread.js";
import { shuffle } from "../assets/js/util.js";

/** A promise resolving to the Stockfish instance. */
let stockfishPromise = (async () => {
  /** The blob of Stockfish.JS. */
  let blob = new Blob(
    [
      await (
        await fetch("https://unpkg.com/stockfish.js@10.0.2/stockfish.js")
      ).text(),
    ],
    { type: "text/javascript" }
  );

  /** The Stockfish.JS worker. */
  let stockfish = thread<string>(new Worker(URL.createObjectURL(blob)));
  stockfish.send("uci");

  while (true) {
    let msg = (await stockfish.reciever.next()).value;
    if (msg == "uciok") return stockfish;
  }
})();

/**
 * Analyzes the current position and scores it.
 * @param game The game to analyze.
 * @returns A number representing the analysis of the current position.
 */
export async function analyze(game: ChessInstance) {
  let stockfish = await stockfishPromise;

  stockfish.send("ucinewgame");
  stockfish.send(`position fen ${game.fen()}`);
  stockfish.send(`go depth 15`);

  while (true) {
    let msg = (await stockfish.reciever.next()).value;

    let match = msg.match(/info depth 15.+ score (cp|mate) (-?[0-9]+)/);
    if (match) {
      let score = +match[2];
      if (game.turn() == "b") score = -score;

      if (match[1] == "cp") return score / 100;
      else return `M${score}` as const;
    }
  }
}

/**
 * Finds the best move in a given position.
 * @param game The game to analyze.
 * @returns The best move for the current position.
 */
export function bestMove(game: ChessInstance) {
  return shuffle(game.moves())[0];
}

stockfishPromise.then(async (sf) => {
  window.sf = sf;
});

declare global {
  var sf: Thread<string>;
}
