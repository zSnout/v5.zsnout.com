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
 * Analyzes the current position and scores it.
 * @param game The game to analyze.
 * @returns A number representing the analysis of the current position.
 */
export async function analyze(game: ChessInstance) {
  let stockfish = await stockfishPromise;

  stockfish.send("ucinewgame");
  stockfish.send(`position fen ${game.fen()}`);
  stockfish.send(`go movetime 1000`);

  let lastmsg = (await stockfish.reciever.next()).value;
  while (true) {
    let msg = (await stockfish.reciever.next()).value;

    if (msg.startsWith("bestmove")) {
      let match = lastmsg.match(/score (cp|mate) (-?\d+)/);
      if (!match) return 0;

      let score = +match[2];
      if (game.turn() == "b") score = -score;

      if (match[1] == "cp") return score / 100;
      else if (score > 0) return `M${score}` as const;
      else if (score < 0) return `-M${-score}` as const;
      else return "GAMEOVER" as const;
    }

    lastmsg = msg;
  }
}

/**
 * Finds the best move in a given position.
 * @param game The game to analyze.
 * @returns The best move for the current position.
 */
export async function bestMove(game: ChessInstance): Promise<ShortMove> {
  let stockfish = await stockfishPromise;

  stockfish.send("ucinewgame");
  stockfish.send(`position fen ${game.fen()}`);
  stockfish.send(`go movetime 1000`);

  while (true) {
    let msg = (await stockfish.reciever.next()).value;

    let match = msg.match(/bestmove ([a-h][1-8])([a-h][1-8])([qnbr]?)/);
    if (match) {
      return {
        from: match[1] as Square,
        to: match[2] as Square,
        promotion: (match[3] || undefined) as "q" | "n" | "b" | "r" | undefined,
      };
    }
  }
}

stockfishPromise.then(async (sf) => {
  window.sf = sf;
});

declare global {
  var sf: Thread<string>;
}
