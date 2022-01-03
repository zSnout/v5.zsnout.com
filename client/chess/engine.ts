import { ChessInstance, Piece, PieceType } from "chess.js";

/** The value of each piece. */
let pieceValues: { [K in PieceType]: number } = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// prettier-ignore
/** A bonus for each white piece in its position. */
let whiteBonuses: { [K in PieceType]: number[][] } = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0 ],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5 ],
    [0,  0,  0, 20, 20,  0,  0,  0 ],
    [5, -5,-10,  0,  0,-10, -5,  5 ],
    [5, 10, 10,-20,-20, 10, 10,  5 ],
    [0,  0,  0,  0,  0,  0,  0,  0 ]
  ],
  n: [
    [-50,-40,-30,-20,-20,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-20,-20,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [ 20,  20,   0,   0,   0,   0,  20,  20],
    [ 20,  30,  10,   0,   0,  10,  30,  20]
  ]
};

/** A bonus for each black piece in its position. */
let blackBonuses = (
  Object.entries(whiteBonuses) as [PieceType, number[][]][]
).map(([k, v]) => [k, [...v].reverse()]);

/** A bonus for each piece based on its position. */
let pieceBonuses = {
  w: whiteBonuses,
  b: Object.fromEntries(blackBonuses),
};

/**
 * Evaluates the current position and returns the score relative to the current player.
 * @param game The game to analyze.
 * @returns A number representing the analysis.
 */
export function evaluate(game: ChessInstance): number {
  // A win is worth Infinity, a loss is worth -Infinity
  if (game.in_checkmate()) return Infinity;
  if (game.game_over()) return -Infinity;

  let turn = game.turn();

  let materialAdvantage = game
    .board()
    .map((row, i) =>
      row
        .filter((e): e is Piece => !!e)
        .map(
          ({ type, color }, j) =>
            (pieceValues[type] + pieceBonuses[color][type][i][j]) *
            (color == turn ? 1 : -1)
        )
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
): [number, string | null] {
  if (depth == 0) return [evaluate(game), null];

  let moves = game.moves();
  if (!moves.length) {
    if (game.in_check()) return [-Infinity, null];
    return [0, null];
  }

  let bestMove: string | null = null;
  for (let move of moves) {
    game.move(move);
    let evaluation = -analyzeDepth(game, depth - 1, -beta, -alpha)[0];
    game.undo();

    if (evaluation >= beta) return [beta, bestMove];

    if (evaluation >= alpha) {
      alpha = evaluation;
      bestMove = move;
    }
  }

  return [alpha, bestMove];
}

/**
 * Finds the best move for the current player.
 * @param game The game to analyze.
 * @returns The best move for the current player.
 */
export function bestMove(game: ChessInstance) {
  return analyzeDepth(game, 3, -Infinity, Infinity)[1];
}

/**
 * Analyzes the current position and scores it.
 * @param game The game to analyze.
 * @returns A number representing the analysis of the current position.
 */
export function analyze(game: ChessInstance) {
  return analyzeDepth(game, 3, -Infinity, Infinity)[0];
}
