/** The type of a piece. */
type Piece =
  | "p"
  | "n"
  | "b"
  | "r"
  | "q"
  | "k"
  | "P"
  | "N"
  | "B"
  | "R"
  | "Q"
  | "K";

/** The type of a board. */
type Board = (Piece | null)[][];

/** The type of a board object. */
type BoardObj = { [K in Square]?: Piece };

/** The type of a square. */
type Square = `\
${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"}\
${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

/** A tuple representing a square. */
type SquareArr = [row: number, col: number];

// To simplify things, we use UCD-style move notation.
/** The type of a move. */
type Move = `${Square}${Square}${"=Q" | "=R" | "=B" | "=N" | ""}`;

/** A class that modifies a headless chess board. */
export class ChessGame {
  /** Possible ways a knight can move. */
  static readonly knightMoveList = [
    [1, 2],
    [2, 1],
    [-1, 2],
    [-2, 1],
    [1, -2],
    [2, -1],
    [-1, -2],
    [-2, -1],
  ];

  /** Directions for a diagonal ray. */
  static readonly diagonalMoveList = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  /** Directions for a straight ray. */
  static readonly straightMoveList = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  /** Directions for a general ray. */
  static readonly anyMoveList = [
    ...ChessGame.diagonalMoveList,
    ...ChessGame.straightMoveList,
  ];

  /** A list of previous boards. */
  history: [
    board: string,
    halfMoves: number,
    castling: `${"K" | ""}${"Q" | ""}${"k" | ""}${"q" | ""}` | "-",
    enPassant: Square | null
  ][] = [];

  /** Represents the current position. */
  board: Board;

  /** The number of half-moves counting towards the 50-move rule. */
  halfMoves = 0;

  /** The en passant target square, if there is one. */
  enPassantSquare: Square | null = null;

  /** The possible castling moves for a side. */
  castling: {
    whiteKing: boolean;
    whiteQueen: boolean;
    blackKing: boolean;
    blackQueen: boolean;
  } = {
    whiteKing: false,
    whiteQueen: false,
    blackKing: false,
    blackQueen: false,
  };

  constructor(
    fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    /** The current turn. */ public turn: "w" | "b" = "w"
  ) {
    this.board = this.parseFen(fen);
    this.setCastlingMoves();
  }

  /**
   * Converts a FEN position to a board.
   * @param fen The fen string to parse.
   * @returns The board represented by the fen string.
   */
  parseFen(fen: string): Board {
    return (fen + "/8/8/8/8/8/8/8/8")
      .replace(/\d+/g, (text) => "e".repeat(+text))
      .split("/")
      .slice(0, 8)
      .reverse()
      .map((e) =>
        (e + "eeeeeeee")
          .slice(0, 8)
          .split("")
          .map((e) => (e == "e" ? null : (e as Piece)))
      );
  }

  /** Gets a list of possible castling moves for a position. */
  setCastlingMoves(withExisting = false) {
    let castling = {
      whiteKing: false,
      whiteQueen: false,
      blackKing: false,
      blackQueen: false,
    };

    if (this.board[0][4] == "K") {
      if (this.board[0][0] == "R") castling.whiteQueen = true;
      if (this.board[0][7] == "R") castling.whiteKing = true;
    }

    if (this.board[7][4] == "k") {
      if (this.board[7][0] == "r") castling.blackQueen = true;
      if (this.board[7][7] == "r") castling.blackKing = true;
    }

    if (!withExisting) {
      this.castling = castling;
      return;
    }

    this.castling.whiteKing &&= castling.whiteKing;
    this.castling.whiteQueen &&= castling.whiteQueen;
    this.castling.blackKing &&= castling.blackKing;
    this.castling.blackQueen &&= castling.blackQueen;
  }

  /**
   * Converts a square name to coordinates.
   * @param square The square's label.
   * @returns A tuple representing the coordinates of the square.
   */
  posOf(square: Square): SquareArr {
    return [+square[1] - 1, square[0].charCodeAt(0) - 97];
  }

  /**
   * Converts coordinates to a square name.
   * @param row The row to use.
   * @param col The column to use.
   * @returns The SAN representation of the square.
   */
  squareOf(row: number, col: number) {
    return `${String.fromCharCode(col + 97)}${row + 1}` as Square;
  }

  /**
   * Gets a list of possible castling moves for a board.
   * @returns A list of possible castling moves.
   */
  encodeCastling() {
    return (
      ([
        this.castling.whiteKing ? "K" : "",
        this.castling.whiteQueen ? "Q" : "",
        this.castling.blackKing ? "k" : "",
        this.castling.blackQueen ? "q" : "",
      ].join("\n") as `${"K" | ""}${"Q" | ""}${"k" | ""}${"q" | ""}`) || "-"
    );
  }

  /**
   * Gets all possible castling moves from a string.
   * @param moves A string representing the possible castling moves.
   * @returns An object of possible castling moves.
   */
  decodeCastling(moves: string) {
    return {
      whiteKing: moves.includes("K"),
      whiteQueen: moves.includes("Q"),
      blackKing: moves.includes("k"),
      blackQueen: moves.includes("q"),
    };
  }

  /**
   * Gets a list of squares on the board.
   * @returns An object containing a list of pieces on the board.
   */
  getBoardObj() {
    let list: BoardObj = {};
    for (let [row, pieces] of Object.entries(this.board)) {
      for (let [col, piece] of Object.entries(pieces)) {
        if (piece) list[this.squareOf(+row, +col)] = piece;
      }
    }

    return list;
  }

  /**
   * Gets the current position as a FEN string.
   * @returns The current position as a FEN string.
   */
  fen(): string;

  /**
   * Sets the current position from a FEN string.
   * @param fen The FEN string to set the position to.
   */
  fen(fen: string): void;

  fen(fen?: string) {
    if (typeof fen == "undefined")
      return this.board
        .map((e) =>
          e
            .map((e) => e || "e")
            .join("")
            .replace(/e+/g, ({ length }) => "" + length)
        )
        .reverse()
        .join("/");
    else this.board = this.parseFen(fen);
  }

  /**
   * Checks the color of a piece.
   * @param piece The piece to check.
   * @returns The piece's color.
   */
  color(piece: Piece): "b" | "w" {
    return piece == piece.toUpperCase() ? "w" : "b";
  }

  /**
   * Moves along a ray until hitting a piece.
   * @param square The square to start from.
   * @param iDiff The ray's row-direction.
   * @param jDiff The ray's column-direction.
   * @returns A list of squares that can be moved to on this ray, including the last piece.
   */
  squaresInRay(
    square: Square,
    iDiff: number,
    jDiff: number
  ): [...square: SquareArr, piece: Piece | null][] {
    let [i, j] = this.posOf(square);
    let iEnd = i + iDiff;
    let jEnd = j + jDiff;
    let squares: [...square: SquareArr, piece: Piece | null][] = [];

    while (iEnd >= 0 && jEnd >= 0 && iEnd < 8 && jEnd < 8) {
      let piece = this.board[iEnd][jEnd];
      squares.push([iEnd, jEnd, piece]);
      if (piece !== null) break;

      iEnd += iDiff;
      jEnd += jDiff;
    }

    return squares;
  }

  /**
   * Moves along a ray until hitting a piece.
   * @param square The square to start from.
   * @param iDiff The ray's row-direction.
   * @param jDiff The ray's column-direction.
   * @returns The first occupied square along the ray.
   */
  rayEndsAt(
    square: Square,
    iDiff: number,
    jDiff: number
  ): [...square: SquareArr, piece: Piece | null] {
    let result = this.squaresInRay(square, iDiff, jDiff).at(-1);
    let pos = this.posOf(square);
    return result || [pos[0] + iDiff, pos[1] + jDiff, null];
  }

  /**
   * Gets a piece on the board.
   * @param row The row to get from.
   * @param col The column to get from.
   * @returns The piece at the square, or `null` if no piece is present or if the position is out of bounds.
   */
  pieceAt(row: number, col: number) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row][col];
  }

  /**
   * Finds pieces that attack or defend a square.
   * @param square The square to check.
   * @returns A list of squares that attack or defend the square.
   */
  squareSeenBy(square: Square): [square: string, piece: Piece][] {
    let [row, col] = this.posOf(square);
    let squares: [...square: SquareArr, piece: Piece][] = [];

    for (let [i, j] of ChessGame.diagonalMoveList) {
      let [lastRow, lastCol, piece] = this.rayEndsAt(square, i, j);

      if (piece == "Q" || piece == "q" || piece == "B" || piece == "b")
        squares.push([lastRow, lastCol, piece]);
    }

    for (let [i, j] of ChessGame.straightMoveList) {
      let [lastRow, lastCol, piece] = this.rayEndsAt(square, i, j);

      if (piece == "Q" || piece == "q" || piece == "R" || piece == "r")
        squares.push([lastRow, lastCol, piece]);
    }

    for (let [i, j] of ChessGame.anyMoveList) {
      let [lastRow, lastCol] = [row + i, col + j];
      let piece = this.pieceAt(lastRow, lastCol);

      if (piece == "K" || piece == "k") squares.push([lastRow, lastCol, piece]);
    }

    for (let j of [1, -1]) {
      let [lastRow, lastCol] = [row - 1, col + j];
      let piece = this.pieceAt(lastRow, lastCol);

      if (piece == "P") squares.push([lastRow, lastCol, piece]);
    }

    for (let j of [1, -1]) {
      let [lastRow, lastCol] = [row + 1, col + j];
      let piece = this.pieceAt(lastRow, lastCol);

      if (piece == "p") squares.push([lastRow, lastCol, piece]);
    }

    for (let [i, j] of ChessGame.knightMoveList) {
      let [lastRow, lastCol] = [row + i, col + j];
      let piece = this.pieceAt(lastRow, lastCol);

      if (piece == "N" || piece == "n") squares.push([lastRow, lastCol, piece]);
    }

    return squares.map(([row, col, piece]) => [this.squareOf(row, col), piece]);
  }

  /**
   * Finds pieces that attack a square.
   * @param square The square to check.
   * @returns A list of squares that attack the square.
   */
  squareAttackedBy(square: Square) {
    let seenBy = this.squareSeenBy(square);
    let piece = this.pieceAt(...this.posOf(square));
    if (piece === null) return seenBy;

    let color = this.color(piece);
    return seenBy.filter(([_, piece]) => this.color(piece) != color);
  }

  /**
   * Finds pieces that defend a square.
   * @param square The square to check.
   * @returns A list of squares that defend the square.
   */
  squareDefendedBy(square: Square) {
    let seenBy = this.squareSeenBy(square);
    let piece = this.pieceAt(...this.posOf(square));
    if (piece === null) return [];

    let color = this.color(piece);
    return seenBy.filter(([_, piece]) => this.color(piece) == color);
  }

  /**
   * Makes a move on this board.
   * @param move The move to be made.
   */
  makeMove(move: Move) {
    this.history.push([
      this.fen(),
      this.halfMoves,
      this.encodeCastling(),
      this.enPassantSquare,
    ]);

    let from = this.posOf(move.slice(0, 2) as Square);
    let to = this.posOf(move.slice(2, 4) as Square);
    let piece = this.pieceAt(...from);
    this.board[to[0]][to[1]] = this.board[from[0]][from[1]];
    this.board[from[0]][from[1]] = null;

    if (piece?.toUpperCase() == "P" && Math.abs(to[0] - from[0]) == 2)
      this.enPassantSquare = this.squareOf(...to);
    else this.enPassantSquare = null;

    if (piece == "K" || piece == "k") {
      if (from[0] == to[0] && to[1] - from[1] == 2) {
        if (from[0] == 0) {
          this.board[to[0]][to[1] - 1] = "R";
          this.board[from[0]][7] = null;
        }
      }
    }

    if (piece == "K")
      (this.castling.whiteKing = false), (this.castling.whiteQueen = false);
    if (piece == "k")
      (this.castling.blackKing = false), (this.castling.blackQueen = false);

    if (piece == "R" && from[1] == 0) this.castling.whiteQueen = false;
    if (piece == "R" && from[1] == 7) this.castling.whiteKing = false;
    if (piece == "r" && from[1] == 0) this.castling.blackQueen = false;
    if (piece == "r" && from[1] == 7) this.castling.blackKing = false;

    this.turn = this.turn == "w" ? "b" : "w";
  }

  /** Undoes the last move made. */
  undoMove() {
    let old = this.history.pop();
    if (!old) return;

    this.board = this.parseFen(old[0]);
    this.halfMoves = old[1];
    this.castling = this.decodeCastling(old[2]);
    this.enPassantSquare = old[3];
    this.turn = this.turn == "w" ? "b" : "w";
  }

  /**
   * Gets a list of moves for a piece.
   * @param square The square to be moved.
   * @returns A list of moves for this square.
   */
  movesForPiece(square: Square): Move[] {
    let [row, col] = this.posOf(square);
    let piece = this.pieceAt(row, col);
    if (piece === null) return [];

    let color = this.color(piece);
    let type = piece.toUpperCase();
    let moves: SquareArr[] = [];

    // for knights and kings we check for empty squares and pieces of opposite color
    // out-of-bounds check is performed later

    if (type == "N") {
      for (let [i, j] of ChessGame.knightMoveList) {
        let piece = this.pieceAt(row + i, col + j);
        if (piece === null || this.color(piece) != color)
          moves.push([row + i, col + j]);
      }
    }

    if (type == "P") {
      let dir = color == "w" ? 1 : -1;
      let firstRank = color == "w" ? 1 : 6;
      let zerothRank = color == "w" ? 0 : 7;

      let [epRow, epCol] = this.enPassantSquare
        ? this.posOf(this.enPassantSquare)
        : [null, null];

      if (this.pieceAt(row + dir, col) === null) moves.push([row + dir, col]);

      if (row == firstRank && this.pieceAt(row + 2 * dir, col) === null)
        moves.push([row + 2 * dir, col]);
      else if (row == zerothRank && this.pieceAt(row + 2 * dir, col) === null)
        moves.push([row + 2 * dir, col]);

      for (let j of [-1, 1]) {
        let piece = this.pieceAt(row + dir, col + j);
        if (piece !== null && this.color(piece) != color)
          moves.push([row + dir, col + j]);

        if (epRow === null || epCol === null) continue;
        let epPiece = this.pieceAt(epRow, epCol);

        if (
          piece === null &&
          epPiece &&
          this.color(epPiece) != color &&
          epRow == row &&
          epCol == col + j
        ) {
          moves.push([row + dir, col + j]);
        }
      }
    }

    if (type == "K") {
      for (let [i, j] of ChessGame.anyMoveList) {
        let [lastRow, lastCol] = [row + i, col + j];
        let piece = this.pieceAt(lastRow, lastCol);
        if (piece === null || this.color(piece) != color)
          moves.push([lastRow, lastCol]);
      }

      this.setCastlingMoves(true);
      if (
        this.castling[`${color == "w" ? "white" : "black"}King`] &&
        this.pieceAt(row, col + 1) === null &&
        this.pieceAt(row, col + 2) === null
      ) {
        let valid = true;
        for (let j of [0, 1, 2]) {
          this.makeMove(
            `${this.squareOf(row, col)}${this.squareOf(row, col + j)}`
          );

          if (this.inCheck(color)) {
            valid = false;
            break;
          }

          this.undoMove();
        }

        if (valid) moves.push([row, col + 2]);
      }

      if (
        this.castling[`${color == "w" ? "white" : "black"}Queen`] &&
        this.pieceAt(row, col - 1) === null &&
        this.pieceAt(row, col - 2) === null &&
        this.pieceAt(row, col - 3) === null
      ) {
        let valid = true;
        for (let j of [0, -1, -2]) {
          this.makeMove(
            `${this.squareOf(row, col)}${this.squareOf(row, col + j)}`
          );

          if (this.inCheck(color)) {
            valid = false;
            break;
          }

          this.undoMove();
        }

        if (valid) moves.push([row, col - 2]);
      }
    }

    if (type == "R" || type == "Q") {
      for (let [i, j] of ChessGame.straightMoveList) {
        let squares = this.squaresInRay(square, i, j);
        if (squares.length == 0) continue;

        squares.slice(0, -1).map(([row, col]) => moves.push([row, col]));
        let [row, col, pc] = squares[squares.length - 1];
        if (pc === null || this.color(pc) != color) moves.push([row, col]);
      }
    }

    if (type == "B" || type == "Q") {
      for (let [i, j] of ChessGame.diagonalMoveList) {
        let squares = this.squaresInRay(square, i, j);
        if (squares.length == 0) continue;

        squares.slice(0, -1).map(([row, col]) => moves.push([row, col]));
        let [row, col, pc] = squares[squares.length - 1];
        if (pc === null || this.color(pc) != color) moves.push([row, col]);
      }
    }

    // Make sure moves don't take pieces out-of-bounds
    moves = moves.filter(([r, c]) => r >= 0 && r <= 7 && c >= 0 && c <= 7);

    // Make sure our king isn't in check after moving
    moves = moves.filter(([r, c]) => {
      this.makeMove(`${square}${this.squareOf(r, c)}`);
      let inCheck = this.inCheck(color);
      this.undoMove();

      return !inCheck;
    });

    return moves
      .map<Move | Move[]>(([row, col]) => {
        let endSquare = this.squareOf(row, col);
        let piece = this.pieceAt(row, col);
        let move: `${Square}${Square}` = `${square}${endSquare}`;

        if ((piece == "p" && row == 0) || (piece == "P" && row == 7))
          return ["Q", "R", "B", "N"].map((e) => `${move}=${e}`) as Move[];
        else return move;
      })
      .flat();
  }

  /**
   * Gets a list of moves for a color.
   * @param color The color of the player to move.
   * @returns A list of moves for that player.
   */
  movesForColor(color = this.turn): Move[] {
    let pieces = Object.entries(this.getBoardObj())
      .filter(([, piece]) => this.color(piece) == color)
      .map((e) => e[0]);

    return pieces.map((e) => this.movesForPiece(e)).flat();
  }

  /**
   * Checks if the king is in check.
   * @param color The color of the king to check.
   * @returns Whether the king is in check.
   */
  inCheck(color = this.turn) {
    let myKing = Object.entries(this.getBoardObj()).filter(
      (e): e is [Square, "K" | "k"] =>
        e[1].toLowerCase() == "k" && this.color(e[1]) == color
    )[0][0];

    return this.squareAttackedBy(myKing).length > 0;
  }

  /**
   * Gets the number of possible moves up to a certain depth.
   * @param depth The depth to check to.
   * @param seq The sequence to be console.logged.
   * @returns The number of moves up to a specified depth.
   */
  subperft(depth: number, seq = "") {
    if (depth == 0) return this.perftData.push(seq), 1;

    let moves = this.movesForColor();
    let count = 0;

    for (let move of moves) {
      let from = this.posOf(move.slice(0, 2) as Square);
      let piece = this.pieceAt(...from) || "X";
      this.makeMove(move);
      count += this.subperft(depth - 1, `${seq ? seq + " -> " : ""}${piece}${move}`); // prettier-ignore
      this.undoMove();
    }

    return count;
  }

  /**
   * Gets the number of possible moves up to a certain depth.
   * @param depth The depth to check to.
   * @returns The number of moves up to a specified depth.
   */
  perft(depth: number) {
    this.perftData = [];
    console.log(`SEQUENCE COUNT: ${this.subperft(depth)}`);
    console.log(this.perftData.sort().join("\n"));
  }

  perftData: string[] = [];
}
