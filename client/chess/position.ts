import type { ChessInstance } from "chess.js";
import type { ChessBoardInstance } from "chessboardjs";
import { getLocationHash, randint } from "../assets/js/util.js";
import Chess from "./chessjs.js";

/** The game to be used for FEN validation. */
let game = new Chess();

/**
 * Changes any numbers to repeated `e`s.
 * @param fen The FEN string.
 * @returns An expanded FEN string.
 */
export function expand(fen: string) {
  return fen.replace(/[1-8]/g, (match) => "e".repeat(+match));
}

/**
 * Changes any repeated `e`s to digits.
 * @param fen The FEN string.
 * @returns A minified FEN string.
 */
export function minify(fen: string) {
  return fen.replace(/e+/g, (match) => match.length.toString());
}

/**
 * Checks if a position is valid.
 * @param pos The position to validate.
 * @returns A boolean indicating whether the position is valid.
 */
export function checkPos(pos: string) {
  let rows = expand(pos).split("/");
  if (rows.length != 8) return false;

  let wHasKing = pos.indexOf("K") == pos.lastIndexOf("K") && pos.includes("K");
  let bHasKing = pos.indexOf("k") == pos.lastIndexOf("k") && pos.includes("k");

  return (
    rows.every((row) => row.match(/^[pnbqrkPNBQRKeaAdD?]{8}$/)) &&
    wHasKing &&
    bHasKing
  );
}

/**
 * Checks if a row is valid.
 * @param pos The position to validate.
 * @returns A boolean indicating whether the position is valid.
 */
export function checkRow(pos: string) {
  return !!expand(pos).match(/^[pnbqrkPNBQRKeaAdD?]{8}$/);
}

/**
 * Picks a random piece.
 * @param type The modifier to apply.
 * @returns A random piece.
 */
export function randomPiece(type: "a" | "A" | "d" | "D" | "?" = "?") {
  let num = randint(1, 5);
  let piece =
    num == 2 ? "n" : num == 3 ? "b" : num == 4 ? "r" : num == 5 ? "q" : "p";
  num = randint(2, 5);
  piece +=
    num == 2 ? "n" : num == 3 ? "b" : num == 4 ? "r" : num == 5 ? "q" : "p";

  if (type == "a") return piece[0];
  if (type == "A") return piece[0].toUpperCase();
  if (type == "d") return piece[1];
  if (type == "D") return piece[1].toUpperCase();
  return randint() ? piece[0] : piece[1].toUpperCase();
}

/**
 * Parses a string into a FEN string.
 * @param name The name of the position.
 * @returns A FEN string representing the parsed position.
 */
export default function position(name: string) {
  let position = expand("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  let match;

  for (let pos of name.split(/\s*;\s*/g)) {
    if ((match = pos.match(/^board-(.+)$/)) && checkPos(match[1]))
      position = match[1];

    if ((match = pos.match(/^rank-([1-8]+)-([pnbqrkPNBQRKeaAdD?])$/)))
      pos = `rank-${match[1]}-${match[2].repeat(8)}`;

    if ((match = pos.match(/^file-([a-h]+)-([pnbqrkPNBQRKeaAdD?])$/)))
      pos = `file-${match[1]}-${match[2].repeat(8)}`;

    if ((match = pos.match(/^rank-([1-8]+)-(.+)$/)) && checkRow(match[2])) {
      for (let rank of match[1].split("")) {
        let newPos = position.split("/");
        newPos[8 - +rank] = expand(match[2]);
        position = newPos.join("/");
      }
    }

    if ((match = pos.match(/^file-([a-h]+)-(.+)$/)) && checkRow(match[2])) {
      for (let filetxt of match[1].split("")) {
        let file = filetxt.charCodeAt(0) - 97;
        let newPos = position.split("/");
        let data = expand(match[2]);
        for (let i = 0; i < newPos.length; i++)
          newPos[i] = newPos[i]
            .split("")
            .map((e, j) => (j == file ? data[7 - i] : e))
            .join("");

        position = newPos.join("/");
      }
    }

    if (
      (match = pos.match(/^square-((?:[a-h][1-8])+)-([pnbqrkPNBQRKeaAdD?])$/))
    ) {
      for (let sqr of match[1].match(/[a-h][1-8]/g) || []) {
        let file = sqr.charCodeAt(0) - 97;
        let rank = 8 - +sqr[1];
        let newPos = position.split("/");
        let data = expand(match[2]);
        newPos[rank] = newPos[rank]
          .split("")
          .map((e, j) => (j == file ? data[0] : e))
          .join("");

        position = newPos.join("/");
      }
    }

    if ((match = pos.match(/^remove-([pnbqrkPNBQRKaAdD?]+)$/)))
      position = position.replace(new RegExp(`[${match[1]}]`, "g"), "e");

    if (
      (match = pos.match(
        /^change-([pnbqrkPNBQRKaAdD?]+)-([pnbqrkPNBQRKaAdD?])$/
      ))
    )
      position = position.replace(new RegExp(`[${match[1]}]`, "g"), match[2]);

    if ((match = pos.match(/^random-([1-9][0-9]*)$/))) {
      let count = +match[1];
      game.load(minify(position));
      for (let i = 0; i < count; i++) {
        let moves = game.moves();
        if (!moves.length || game.game_over()) break;

        let move = moves[Math.floor(Math.random() * moves.length)];
        game.move(move);
      }

      position = expand(game.fen().split(" ")[0]);
    }
  }

  // Remove `e` squares and expand random pieces.
  position = minify(position).replace(/[AaDd?]/g, (e) => randomPiece(e as any));

  // Check castling availability
  let castling = "";

  let whiteRank = expand(position.split("/")[7]);
  if (whiteRank[4] == "K") {
    if (whiteRank[7] == "R") castling += "K";
    if (whiteRank[0] == "R") castling += "Q";
  }

  let blackRank = expand(position.split("/")[0]);
  if (blackRank[4] == "k") {
    if (blackRank[7] == "r") castling += "k";
    if (blackRank[0] == "r") castling += "q";
  }

  return `${position} w ${castling || "-"} - 0 1`;
}

/**
 * Sets up the a game using a position derived from the location hash.
 * @param game The Chess.JS game instance.
 * @param board The ChessboardJS board instance.
 */
export function setupUsingLocationHash(
  game: ChessInstance,
  board: ChessBoardInstance
) {
  game.load(position(getLocationHash()));
  board.position(game.fen(), false);
}
