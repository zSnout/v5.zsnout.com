import type { ChessInstance } from "chess.js";

/** A promise resolving to a list of grandmaster games. */
export let book = fetch("/chess/book.txt")
  .then((resp) => resp.text())
  .then((text) => text.split("\n"));

/**
 * Finds a move from the grandmaster game book.
 * @param game The game to search for.
 * @returns Either the next move in the game, or `null` if no game was found.
 */
export default async function nextGMMove(game: ChessInstance) {
  let allGames = await book;
  let pgn = game.pgn().replace(/\d+\. /g, "");
  let moves = [
    ...new Set(
      allGames
        .filter((e) => e.startsWith(pgn))
        .map((e) => e.slice(pgn.length))
        .map((e) => e.split(" ")[0] || e.split(" ")[1])
        .filter((e) => e != "0-1" && e != "1-0" && e != "1/2-1/2" && e)
    ),
  ];
  if (!moves.length) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}
