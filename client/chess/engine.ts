import type { ChessInstance, PieceType } from "chess.js";

/** The type of a non-king piece. */
type NonKingPiece = { type: Exclude<PieceType, "k">; color: "b" | "w" };

/** The value of each piece. */
let pieceValues: { [K in Exclude<PieceType, "k">]: number } = {
  p: 100,
  n: 300,
  b: 300,
  r: 500,
  q: 900,
};

/**
 * Analyzes the current position.
 * @param game The game to analyze.
 * @returns A number representing the analysis.
 */
export function analyzeNow(game: ChessInstance): number {
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

/**
 * Analyzes the current position.
 * @param game The game to analyze.
 * @param depth The depth to analyze to.
 * @returns A number representing the analysis.
 */
export function analyzeDepth(
  game: ChessInstance,
  depth: number,
  alpha: number,
  beta: number
): number {
  if (depth == 0) return analyzeNow(game);

  let moves = game.moves();
  if (!moves.length) {
    if (game.in_check()) return -Infinity;
    return 0;
  }

  for (let move of moves) {
    game.move(move);
    let evaluation = -analyzeDepth(game, depth - 1, -beta, -alpha);
    game.undo();

    if (evaluation >= beta) return beta;
    alpha = Math.max(alpha, evaluation);
  }

  return alpha;
}

export function analyze(game: ChessInstance) {
  return analyzeDepth(game, 2, -Infinity, Infinity);
}
