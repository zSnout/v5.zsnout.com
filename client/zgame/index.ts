// NOTE: Throughout the code, `x` and `y` are used to refer to mouse coordinates.
//       `i` and `j` are used to refer to tile coordinates. Feel free to submit
//       PRs to fix incorrect usages of these variables.

import $ from "../assets/js/jsx.js";
import { getTheme, ThemeColor } from "../assets/js/util.js";
import { generateBoard } from "./gen.js";

let game = $("#game");
let canvas = game[0] as HTMLCanvasElement;
let wallColor = getTheme(ThemeColor.Element);
let backgroundColor = getTheme(ThemeColor.Background).split(", ").at(-1)!;
let ctx = canvas.getContext("2d")!;
let tileSize = 32;
let xOffset = 0;
let yOffset = 0;

/** Stores information about different tiles. */
type TileDrawHandler = (x: number, y: number) => void;

/** Represents the different tiles a map can have. */
export const enum Tile {
  Air,
  Wall,
  Final,
  // The `Final` tile is never meant to be drawn; it is used to allow tile loops in the editor.
}

/** A list of different events for each tile. */
export const Tiles: { readonly [K in Tile]?: TileDrawHandler } = {
  [Tile.Air]: (x, y) => rect(x, y, tileSize, tileSize, backgroundColor),
  [Tile.Wall]: (x, y) => rect(x, y, tileSize, tileSize, wallColor),
};

/**
 * Draws a rectangle with the given size, position, and color.
 * @param x The x-coordinate of the rectangle.
 * @param y The y-coordinate of the rectangle.
 * @param w The width of the rectangle.
 * @param h The height of the rectangle.
 * @param fillColor The color to fill the rectangle with.
 */
function rect(x: number, y: number, w: number, h: number, fillColor?: string) {
  if (fillColor) ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);
}

/**
 * Draws a tile.
 * @param tile The tile to draw.
 * @param offsetX The X offset of the tile.
 * @param offsetY The Y offset of the tile.
 */
function drawTile(tile: Tile, offsetX: number, offsetY: number) {
  Tiles[tile]?.(offsetX, offsetY);
}

/** Draws the entire map to the canvas. */
function drawAllTiles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      drawTile(map[i][j], j * tileSize + yOffset, i * tileSize + xOffset);
    }
  }
}

/**
 * Converts mouse coordinates to tile coordinates.
 * @param x The x-coordinate of the mouse.
 * @param y The y-coordinate of the mouse.
 * @returns A tuple containing the tile coordinates of the mouse.
 */
export function canvasToGame(
  x: number,
  y: number
): readonly [i: number, j: number] {
  x = (x * canvas.width) / $.main.width() - xOffset;
  y = (y * canvas.height) / $.main.height() - yOffset;

  return [Math.floor(x / tileSize), Math.floor(y / tileSize)];
}

let map = generateBoard();
drawAllTiles();
