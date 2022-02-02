import { Tile } from ".";

/**
 * Creates a very basic map of tiles.
 * @param width The width of the map.
 * @param height The height of the map.
 * @returns A 2D array of tiles.
 */
function createBase(width: number, height: number) {
  let base: Tile[][] = Array(height)
    .fill(!!0)
    .map(() => Array(width).fill(Tile.Air));

  base[0] = Array(width).fill(Tile.Wall);
  base[height - 1] = Array(width).fill(Tile.Wall);
  base = base
    .map((row) => ((row[0] = Tile.Wall), row))
    .map((row) => ((row[width - 1] = Tile.Wall), row));

  base[height - 2][width - 1] = Tile.Exit;
  base[height - 3][width - 1] = Tile.Exit;

  return base;
}

/**
 * Creates a tile map using advanced generation techniques.
 * @returns A 2D array of tiles.
 */
export function generateBoard(): Tile[][] {
  let base = createBase(96, 64);

  return base;
}
