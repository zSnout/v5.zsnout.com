import type { Chess } from "chess.js";
import "./preload.js";
import "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.12.0/chess.min.js";

export default (window as any).exports.Chess as typeof Chess;
