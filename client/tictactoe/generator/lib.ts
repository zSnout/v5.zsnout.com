import $ from "../../assets/js/jsx.js";

let info = $("#info");

/** The type of a board element. 0 is an empty cell, 1 is a blocker, 2 is a X, and 3 is an O. */
export type BoardEl = 0 | 1 | 2 | 3;

/** The general type of a TicTacToe board. */
export type Board = BoardEl[][];

/** A coordinate specifying a location in a board. */
export type Coordinate = [i: number, j: number];

/** A 3-in-a-row found on a board. */
export type Match = [Coordinate, Coordinate, Coordinate];

/** A list of 3-in-a-rows found in a board. */
export type MatchList = Match[];

/**
 * Finds 3-in-a-row matches in a board where all 3 elements are 0.
 * @param board The board to search in.
 * @returns A list of all 3-in-a-rows found in the board.
 */
export function findMatches(board: Board): MatchList {
  let len = board.length;
  let matches: MatchList = [];

  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len; j++) {
      if (i < len - 2 && !board[i][j] && !board[i + 1][j] && !board[i + 2][j])
        matches.push([[i, j], [i + 1, j], [i + 2, j]]); // prettier-ignore

      if (j < len - 2 && !board[i][j] && !board[i][j + 1] && !board[i][j + 2])
        matches.push([[i, j], [i, j + 1], [i, j + 2]]); // prettier-ignore

      // prettier-ignore
      if (i < len - 2 && j < len - 2 && !board[i][j] && !board[i + 1][j + 1] && !board[i + 2][j + 2])
        matches.push([[i, j], [i + 1, j + 1], [i + 2, j + 2]]); // prettier-ignore

      // prettier-ignore
      if (i >= 2 && j < len - 2 && !board[i][j] && !board[i - 1][j + 1] && !board[i - 2][j + 2])
        matches.push([[i, j], [i - 1, j + 1], [i - 2, j + 2]]); // prettier-ignore
    }
  }

  return matches;
}

/**
 * Checks to see if a board has a 4-in-a-row.
 * @param board The board to search in.
 * @returns A boolean indicating whether the specified board has a 4-in-a-row.
 */
export function boardHas4InARow(board: Board): boolean {
  let len = board.length;

  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len; j++) {
      // prettier-ignore
      if (i < len - 3 && !board[i][j] && !board[i + 1][j] && !board[i + 2][j] && !board[i + 3][j])
        return true;

      // prettier-ignore
      if (j < len - 3 && !board[i][j] && !board[i][j + 1] && !board[i][j + 2] && !board[i][j + 3])
        return true;

      // prettier-ignore
      if (i < len - 3 && j < len - 3 && !board[i][j] && !board[i + 1][j + 1] && !board[i + 2][j + 2] && !board[i + 3][j + 3])
        return true;

      // prettier-ignore
      if (i >= 3 && j < len - 3 && !board[i][j] && !board[i - 1][j + 1] && !board[i - 2][j + 2] && !board[i - 3][j + 3])
        return true;
    }
  }

  return false;
}

/**
 * Converts a board to HTML.
 * @param board The board to convert.
 * @returns A HTML representation of the board.
 */
export function boardToHTML(board: Board) {
  return `<div class="board">${board
    .map(
      (row) =>
        `<div class="row">${row
          .map((el) => `<span class="${el ? "blocker" : "empty"}"></span>`)
          .join("")}</div>`
    )
    .join("")}</div>`;
}

/**
 * Generates a board based off of a binary string.
 * @param size The size of the board to generate.
 * @param index An index specifying which board to generate. Should be a binary string.
 * @returns The generated board.
 */
export function generateBoard(size: number, index: string) {
  let board: Board = Array.from<unknown, 0[]>({ length: size }, () =>
    Array(size).fill(0)
  );

  let blockerCount = index.split("").filter((e) => e == "1").length;
  if (blockerCount <= size) return null;
  if (blockerCount >= size * size - size) return null;

  let bin = ("0".repeat(size * size) + index)
    .slice(-size * size)
    .split("")
    .map(Number)
    .map<[char: 0 | 1, index: number]>((e, i) => [e as 0 | 1, i]);

  for (let [char, index] of bin)
    board[Math.floor(index / size)][index % size] = char;

  return board;
}

/**
 * Generates a list of the best boards for a size.
 * @param size The size of the boards to generate.
 * @returns A list of the best boards for each size.
 */
export async function bestBoards(size: number) {
  let boards = [];
  let matches = 0;
  let start = Date.now();

  let c = 2 ** (size * size);
  for (let i = 0; i < c; i++) {
    if (i % 100000 == 0) {
      let percentDone = Math.floor((i / c) * 10000) / 100;
      let timeUsed = Math.floor((Date.now() - start) / 100) / 10;

      info.text(
        `Generated ${i} out of ${c} boards in ${timeUsed}s (${percentDone}%)...`
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    let b = generateBoard(size, i.toString(2));
    if (!b) continue;
    if (boardHas4InARow(b)) continue;
    let m = findMatches(b).length;
    if (!m) continue;

    if (m > matches) {
      matches = m;
      boards = [];
    }

    if (m == matches) boards.push(encode(b));
  }

  let unique: string[] = [];

  outer: for (let board of boards) {
    for (let old of unique) {
      if (areIdentical(decode(board), decode(old))) {
        break outer;
      }
    }

    unique.push(board);
  }

  return unique.map(decode).map(boardToHTML);
}

/**
 * Generates a list of some good boards for a size.
 * @param size The size of the boards to generate.
 * @returns A list of the best boards for each size.
 */
export async function approxBestBoards(size: number, iterations: number) {
  let boards = [];
  let matches = 0;
  let start = Date.now();

  let c = 2 ** (size * size);
  for (let i = 0; i < iterations; i++) {
    if (i % 100000 == 0) {
      let percentDone = Math.floor((i / iterations) * 10000) / 100;
      let timeUsed = Math.floor((Date.now() - start) / 100) / 10;

      $.main.text(
        `Generated ${i} out of ${iterations} boards in ${timeUsed}s (${percentDone}%)...`
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    let b = generateBoard(size, Math.floor(c * Math.random()).toString(2));
    if (!b) continue;
    if (boardHas4InARow(b)) continue;
    let m = findMatches(b).length;
    if (!m) continue;

    if (m > matches) {
      matches = m;
      boards = [];
    }

    if (m == matches) boards.push(encode(b));
  }

  let unique: string[] = [];

  outer: for (let board of boards) {
    for (let old of unique) {
      if (areIdentical(decode(board), decode(old))) {
        break outer;
      }
    }

    unique.push(board);
  }

  return unique.map(decode).map(boardToHTML);
}

/**
 * Checks if two boards are identical after transposing and rotating.
 * @param board1 The board to compare against.
 * @param board2 The board to compare.
 * @returns A boolean indicating whether the boards are identical after transposing and rotating.
 */
export function areIdentical(board1: Board, board2: Board) {
  let isSame = (board: Board) => encode(board1) == encode(board);

  let transpose = (board: Board) =>
    board[0].map((_, i) => board.map((x) => x[i]));

  let rotate = (board: Board) =>
    board[0].map((_, index) => board.map((row) => row[index]).reverse());

  let r1 = rotate(board1);
  let r2 = rotate(r1);
  let r3 = rotate(r2);

  if (isSame(board2)) return true;
  if (isSame(r1)) return true;
  if (isSame(r2)) return true;
  if (isSame(r3)) return true;
  if (isSame(transpose(board2))) return true;
  if (isSame(transpose(r1))) return true;
  if (isSame(transpose(r2))) return true;
  if (isSame(transpose(r3))) return true;

  return false;
}

/**
 * Encodes a board into a string. Useful for checking if two boards are identical.
 * @param board The board to encode.
 * @returns The encoded board.
 */
export function encode(board: Board): string {
  return board.map((e) => e.join("-")).join("+");
}

/**
 * Decodes a string into a board. Useful for checking if two boards are identical.
 * @param string The string to decode.
 * @returns The decoded string.
 */
export function decode(string: string): Board {
  return string.split("+").map((e) => e.split("-").map((e) => +e as BoardEl));
}
