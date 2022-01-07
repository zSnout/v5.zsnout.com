import type { Chess } from "chess.js";
import "./preload.js";
import "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.12.0/chess.min.js";

// Instead of adding an `exports` variable using declare var,
// we want to prevent `exports` from being introduced into the global scope in `client`.
export default (window as any).exports.Chess as typeof Chess;
