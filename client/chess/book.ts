import type { ChessInstance, ShortMove } from "chess.js";

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
  let games = allGames.filter((e) => e.startsWith(pgn));
  if (!games.length) return null;
  let line = games[Math.floor(Math.random() * games.length)];
  return line.slice(pgn.length + 1).split(" ")[0] || null;
}
