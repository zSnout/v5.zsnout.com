import type { ChessInstance } from "chess.js";
import type { ChessBoardInstance } from "chessboardjs";
import { getLocationHash } from "../assets/js/util.js";
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
    rows.every((row) => row.match(/^[pnbqrkPNBQRKe]{8}$/)) &&
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
  return !!expand(pos).match(/^[pnbqrkPNBQRKe]{8}$/);
}

/**
 * Parses a string into a FEN string.
 * @param name The name of the position.
 * @returns A FEN string representing the parsed position.
 */
export default function position(name: string) {
  console.log("parsing position...");
  let position = expand("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  let match;

  for (let pos of name.split(/\s*;\s*/g)) {
    console.log(`parsing ${pos}...`);
    if ((match = pos.match(/^board-(.+)$/)) && checkPos(match[1]))
      position = match[1];

    if ((match = pos.match(/^rank-([1-8])-(.+)$/)) && checkRow(match[2])) {
      let newPos = position.split("/");
      newPos[8 - +match[1]] = match[2];
      if (checkPos(newPos.join("/"))) position = newPos.join("/");
    }

    if ((match = pos.match(/^file-([a-h])-(.+)$/)) && checkRow(match[2])) {
      /** The file to be changed, from 0-7. */
      let file = match[1].charCodeAt(0) - 97;
      let newPos = position.split("/");
      let data = expand(match[2]);
      for (let i = 0; i < newPos.length; i++)
        newPos[i] = newPos[i]
          .split("")
          .map((e, j) => (j == file ? data[7 - i] : e))
          .join("");

      if (checkPos(newPos.join("/"))) position = newPos.join("/");
    }

    if ((match = pos.match(/^remove-([pnbqrkPNBQRK]+)$/)))
      position = position.replace(new RegExp(`[${match[1]}]`, "g"), "e");

    if ((match = pos.match(/^change-([pnbqrkPNBQRK]+)-([pnbqrkPNBQRK])$/)))
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

  console.log(`new position: ${position}`);

  // Remove `e` squares
  position = minify(position);

  console.log(`new position: ${position}`);

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
  board.position(game.fen());
}
