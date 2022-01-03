import type { ChessInstance, PieceType } from "chess.js";

/** The type of a non-king piece. */
type NonKingPiece = { type: Exclude<PieceType, "k">; color: "b" | "w" };

/** The value of each piece. */
let pieceValues: { [K in Exclude<PieceType, "k">]: number } = {
  p: 100,
  n: 300,
  b: 315,
  r: 500,
  q: 900,
};

/**
 * Analyzes the current position.
 * @param game The game to analyze.
 * @returns A number representing the analysis.
 */
export function analyze(game: ChessInstance): number {
  // A win is worth Infinity, a loss is worth -Infinity
  if (game.in_checkmate()) return Infinity;
  if (game.game_over()) return -Infinity;

  let turn = game.turn();

  let materialAdvantage = game
    .board()
    .map((row) =>
      row
        .filter((e): e is NonKingPiece => !!(e && e.type != "k"))
        .map(({ type, color }) => pieceValues[type] * (color == turn ? 1 : -1))
        .reduce((a, b) => a + b, 0)
    )
    .reduce((a, b) => a + b, 0);

  return materialAdvantage / 100;
}
