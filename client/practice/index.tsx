import $, { jsx } from "../assets/js/jsx.js";

/** The input field. */
let field = $("#field");

/** The input form. */
let form = $("#form");

/** The answer to the current problem. */
let answer: string = "";

/** The number of wrong answers so far. */
let wrongAnswers = 0;

/** The type of a problem creator. */
export type ProblemCreator = () => [
  answer: any,
  pretext?: string,
  posttext?: string
];

/**
 * Starts a question/answer prompter.
 * @param createProblem The function that creates a problem.
 */
export default function useProblemCreator(createProblem: ProblemCreator) {
  /** Creates a new problem and puts it into the DOM. */
  function newProblem() {
    let [ans, pretext, posttext] = createProblem();

    let element = (
      <div id="problem">
        {pretext || ""}
        {field}
        {posttext || ""}
      </div>
    );

    answer = ans;
    wrongAnswers = 0;
    form.empty().append(element);
    field.attr("placeholder", "").val("").focus();
  }

  newProblem();
  form.on("submit", (event) => {
    event.preventDefault();

    if (field.val() == answer) {
      newProblem();
    } else {
      wrongAnswers++;
      if (wrongAnswers >= 2) field.attr("placeholder", answer);
      field.val("").focus();
    }
  });
}
