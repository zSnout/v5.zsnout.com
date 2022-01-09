import type { ChessInstance } from "chess.js";
import Chess from "../chessjs.js";

/** The different statuses of the end of a game. */
export enum EndingGameStatus {
  WhiteWin = "WHITE_WIN",
  BlackWin = "BLACK_WIN",
  Stalemate = "STALEMATE",
  InsufficientMaterial = "INSUFFICIENT_MATERIAL",
  ThreefoldRepition = "THREEFOLD_REPITION",
  FiftyMoveRule = "FIFTY_MOVE_RULE",
  Unknown = "UNKNOWN",
}

/**
 * Plays a game of chess with random moves until it ends.
 * @returns The `ChessInstance` of the game.
 */
export function randomGame() {
  let game = new Chess();

  while (!game.game_over()) {
    let moves = game.moves();
    game.move(moves[Math.floor(Math.random() * moves.length)]);
  }

  return game;
}

/**
 * Finds the status of a completed game.
 * @param game The `ChessInstance` of the game.
 * @returns The status of the end of the game.
 */
export function gameStatus(game: ChessInstance) {
  if (game.in_checkmate() && game.turn() == "w")
    return EndingGameStatus.BlackWin;
  if (game.in_checkmate()) return EndingGameStatus.WhiteWin;
  if (game.in_stalemate()) return EndingGameStatus.Stalemate;
  if (game.in_threefold_repetition()) return EndingGameStatus.ThreefoldRepition;
  if (game.insufficient_material())
    return EndingGameStatus.InsufficientMaterial;
  if (game.in_draw()) return EndingGameStatus.FiftyMoveRule;

  return EndingGameStatus.Unknown;
}

/**
 * Plays random games and returns the statuses of them.
 * @param gameCount The number of games to play.
 */
export function tryMany(gameCount: number) {
  return Array(gameCount)
    .fill(EndingGameStatus.Unknown)
    .map(
      (e, i) => (
        console.log(`Playing game ${i + 1}...`), gameStatus(randomGame())
      )
    );
}

/**
 * Aggregates the statuses of many completed games.
 * @param statuses The statuses of the games.
 * @returns An object with the different statuses of the games.
 */
export function totalStatuses(statuses: EndingGameStatus[]) {
  return statuses.reduce(
    (acc, status) => ({ ...acc, [status]: (acc[status] || 0) + 1 }),
    {} as { [K in EndingGameStatus]?: number }
  );
}

/**
 * Continuously plays random games and prints the statuses of them.
 * @param outputEvery The number of games to play before printing the results.
 */
export function continuous(outputEvery: number) {
  let i = 0;
  let games: EndingGameStatus[] = [];
  while (true) {
    console.log(`Playing game ${++i}...`);
    games.push(gameStatus(randomGame()));

    if (i % outputEvery == 0) console.log(totalStatuses(games));
  }
}
