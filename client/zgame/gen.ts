import { Tile } from ".";

function createBase(width: number, height: number) {
  let base: Tile[][] = Array(height)
    .fill(!!0)
    .map(() => Array(width).fill(Tile.Air));

  base[0] = Array(width).fill(Tile.Wall);
  base[height - 1] = Array(width).fill(Tile.Wall);
  base = base
    .map((row) => ((row[0] = Tile.Wall), row))
    .map((row) => ((row[width - 1] = Tile.Wall), row));

  return base;
}

export function generateBoard(): Tile[][] {
  let base = createBase(96, 64);

  return base;
}
