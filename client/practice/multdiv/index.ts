import { randint } from "../../assets/js/util.js";
import useProblemCreator from "../index.js";

/** The type of a multiplication or division problem. */
type Problem = [
  first: number,
  second: number,
  answer: number,
  type: "mult" | "div"
];

/**
 * Generates a problem from 2x2 to 12x12.
 * @returns A multiplication or division problem.
 */
function createProblem(): Problem {
  let first = randint(2, 12);
  let second = randint(2, 12);

  if (randint() == 1) return [first * second, first, second, "div"];
  else return [first, second, first * second, "mult"];
}

useProblemCreator(() => {
  let [first, second, ans, type] = createProblem();
  let pretext = `${first} ${type == "mult" ? "×" : "÷"} ${second} = `;
  return [ans, pretext];
});
