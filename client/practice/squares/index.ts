import { randint } from "../../assets/js/util.js";
import useProblemCreator from "../index.js";

/** The type of a multiplication or division problem. */
type Problem = [number: number, square: number];

/**
 * Generates a problem from 2x2 to 12x12.
 * @returns A multiplication or division problem.
 */
function createProblem(): Problem {
  let first = randint(2, 20);
  return [first, first * first];
}

useProblemCreator(() => {
  let [number, square] = createProblem();
  let pretext = `${number}² = `;
  return [square, pretext];
});
