import type { ChessInstance, ShortMove, Square } from "chess.js";
import thread, { Thread } from "../assets/js/thread.js";

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
 * Analyzes the current position, scores it, and finds the best move.
 * @param game The game to analyze.
 * @returns The data found from the analysis.
 */
export async function stockfish(
  game: ChessInstance
): Promise<
  [score: number | `M${number}` | `-M${number}`, bestMove: ShortMove] | null
> {
  let stockfish = await stockfishPromise;

  stockfish.send("ucinewgame");
  stockfish.send(`position fen ${game.fen()}`);
  stockfish.send(`go movetime 1000`);

  let lastmsg = (await stockfish.reciever.next()).value;
  while (true) {
    let msg = (await stockfish.reciever.next()).value;

    if (msg.startsWith("bestmove")) {
      let match = lastmsg.match(/score (cp|mate) (-?\d+)/);
      let bestmove = msg.match(/bestmove ([a-h][1-8])([a-h][1-8])([qnbr]?)/);
      if (!match || !bestmove) return null;

      let move: ShortMove = {
        from: match[1] as Square,
        to: match[2] as Square,
        promotion: (match[3] || undefined) as "q" | "n" | "b" | "r" | undefined,
      };

      let score = +match[2];
      if (game.turn() == "b") score = -score;

      if (match[1] == "cp") return [score / 100, move];
      else if (score > 0) return [`M${score}`, move];
      else if (score < 0) return [`-M${-score}`, move];
      else return null;
    }

    lastmsg = msg;
  }
}

/**
 * Finds the best move in a given position.
 * @param game The game to analyze.
 * @returns The best move for the current position.
 */
export async function analyze(game: ChessInstance) {
  return ((await stockfish(game)) || [0])[0];
}

/**
 * Finds the best move in a given position.
 * @param game The game to analyze.
 * @returns The best move for the current position.
 */
export async function bestMove(game: ChessInstance): Promise<ShortMove | null> {
  return (await stockfish(game))![1];
}

stockfishPromise.then(async (sf) => {
  window.sf = sf;
});

declare global {
  var sf: Thread<string>;
}
