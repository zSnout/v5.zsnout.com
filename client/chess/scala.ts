import thread from "../assets/js/thread.js";

// prettier-ignore
type Square = "a0" | "a1" | "b1" | "c1" | "d1" | "e1" | "f1" | "g1" | "h1" | "a2" | "b2" | "c2" | "d2" | "e2" | "f2" | "g2" | "h2" | "a3" | "b3" | "c3" | "d3" | "e3" | "f3" | "g3" | "h3" | "a4" | "b4" | "c4" | "d4" | "e4" | "f4" | "g4" | "h4" | "a5" | "b5" | "c5" | "d5" | "e5" | "f5" | "g5" | "h5" | "a6" | "b6" | "c6" | "d6" | "e6" | "f6" | "g6" | "h6" | "a7" | "b7" | "c7" | "d7" | "e7" | "f7" | "g7" | "h7" | "a8" | "b8" | "c8" | "d8" | "e8" | "f8" | "g8" | "h8";

type Color = "white" | "black";

export interface GameSituation {
  readonly id: string;
  readonly ply: number;
  readonly variant: VariantName;
  readonly fen: string;
  readonly player: Color;
  readonly dests: { [K in Square]: readonly Square[] | undefined };
  readonly drops?: readonly string[];
  readonly end: boolean;
  readonly playable: boolean;
  readonly status?: GameStatus;
  readonly winner?: Color;
  readonly check: boolean;
  readonly checkCount?: CheckCount;
  readonly san?: string;
  readonly uci?: string;
  readonly pgnMoves: readonly string[];
  readonly uciMoves: readonly string[];
  readonly promotion?: string;
  readonly crazyhouse?: { readonly pockets: Pockets };
}

export interface InitRequest {
  readonly variant: VariantName;
  readonly fen?: string;
}

export interface InitResponse {
  readonly variant: Variant;
  readonly setup: GameSituation;
}

export interface SituationRequest {
  readonly variant: VariantName;
  readonly fen: string;
  readonly path?: string;
}

export interface SituationResponse {
  readonly situation: GameSituation;
  readonly path: string;
}

export interface MoveRequest {
  readonly variant: VariantName;
  readonly fen: string;
  readonly orig: Square;
  readonly dest: Square;
  readonly pgnMoves?: readonly string[];
  readonly uciMoves?: readonly string[];
  readonly promotion?: "king" | "queen" | "knight" | "bishop" | "rook" | "pawn";
  readonly path?: string;
}

export interface MoveResponse {
  readonly situation: GameSituation;
  readonly path?: string;
}

export interface DropRequest {
  readonly variant: VariantName;
  readonly fen: string;
  readonly pos: Square;
  readonly role: "king" | "queen" | "knight" | "bishop" | "rook" | "pawn";
  readonly pgnMoves?: readonly string[];
  readonly uciMoves?: readonly string[];
  readonly path?: string;
}

export interface ThreefoldTestRequest {
  readonly variant: VariantName;
  readonly initialFen: string;
  readonly pgnMoves: readonly string[];
}

export interface ThreefoldTestResponse {
  readonly threefoldRepetition: boolean;
  readonly status: GameStatus;
}

export interface PgnDumpRequest {
  readonly variant: VariantName;
  readonly initialFen: string;
  readonly pgnMoves: readonly string[];
  readonly white?: string;
  readonly black?: string;
  readonly date?: string;
}

export interface PgnDumpResponse {
  readonly pgn: string;
}

export interface GameStatus {
  readonly id: number;
  readonly name: string;
}

export interface CheckCount {
  readonly white: number;
  readonly black: number;
}

export interface Pocket {
  readonly queen: number;
  readonly rook: number;
  readonly knight: number;
  readonly bishop: number;
  readonly pawn: number;
}

export type Pockets = [Pocket, Pocket];

export type VariantName =
  | "standard"
  | "chess960"
  | "antichess"
  | "fromPosition"
  | "kingOfTheHill"
  | "threeCheck"
  | "atomic"
  | "horde"
  | "racingKings"
  | "crazyhouse";

export interface Variant {
  readonly key: VariantName;
  readonly name: string;
  readonly short: string;
  readonly title?: string;
}

/** A promise resolving to the ScalaChessJS instance. */
let scalaPromise = (async () => {
  /** The blob of ScalaChessJS. */
  let blob = new Blob(
    [
      await (
        await fetch(
          "https://raw.githubusercontent.com/veloce/scalachessjs/master/scalachess.js"
        )
      ).text(),
    ],
    { type: "text/javascript" }
  );

  /** The ScalaChessJS worker. */
  return thread<any>(new Worker(URL.createObjectURL(blob)));
})();

let _callbacks: { [reqid: string]: void | ((data: any) => void) } = {};
(async () => {
  for await (let data of (await scalaPromise).reciever) {
    let callback = _callbacks[data.reqid || ""];
    if (typeof callback == "function") callback(data);
  }
})();

/**
 * Sends a request to ScalaChessJS.
 * @param data The data to send to ScalaChessJS.
 * @returns A promise resolving to ScalaChessJS"s response.
 */
function request(data: any) {
  return new Promise<any>((resolve) => {
    data = { ...data, reqid: Math.random().toString(36).substring(2) };
    _callbacks[data.reqid || ""] = resolve;
    scalaPromise.then((worker) => worker.send(data));
  });
}

export function init(payload: InitRequest): Promise<InitResponse> {
  return request({ topic: "init", payload });
}

export function situation(
  payload: SituationRequest
): Promise<SituationResponse> {
  return request({ topic: "situation", payload });
}

export function move(payload: MoveRequest): Promise<MoveResponse> {
  return request({ topic: "move", payload });
}

export function drop(payload: DropRequest): Promise<MoveResponse> {
  return request({ topic: "drop", payload });
}

export function threefoldTest(
  payload: ThreefoldTestRequest
): Promise<ThreefoldTestResponse> {
  return request({ topic: "threefoldTest", payload });
}

export function pgnDump(payload: PgnDumpRequest): Promise<PgnDumpResponse> {
  return request({ topic: "pgnDump", payload });
}
