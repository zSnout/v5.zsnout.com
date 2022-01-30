// ** is used for implied multiplication
let precds: Record<string, number> = { "+": 2, "-": 2, "*": 3, "/": 3, "**": 4, "^": 5 }; // prettier-ignore
function levelOf(token: string) {
  if (token == "(") return 0;
  return precds[token] || 1;
}

let acs: Record<string, "l" | "r"> = { "+": "l", "-": "l", "*": "l", "/": "l" };
function assocOf(token: string) {
  return acs[token] || "r";
}

let nonFuncs = ["+", "-", "*", "/", "^", "("];
function isFunc(token: string) {
  return !nonFuncs.includes(token);
}

/**
 * Converts an equation to Reverse Polish Notation.
 * @param equation The equation to be converted.
 * @returns The equation in Reverse Polish Notation.
 */
export function toReversePolish(equation: string): (string | number)[] {
  let tokens: (string | number)[] = [];
  let wasLastTokenAValue = false;

  while (true) {
    let match;

    if (equation.length === 0) {
      break;
    } else if ((match = equation.match(/^\d+(?:\.\d+)?/))) {
      if (wasLastTokenAValue) tokens.push("**");
      wasLastTokenAValue = true;

      tokens.push(+match[0]);
      equation = equation.slice(match[0].length);
    } else if (
      (match = equation.match(/^(pi|sin|cos|tan|exp|log|abs|min|max)/))
    ) {
      if (wasLastTokenAValue) tokens.push("**");
      wasLastTokenAValue = match[0] == "pi";

      tokens.push(match[0]);
      equation = equation.slice(match[0].length);
    } else if (equation[0] == "z" || equation[0] == "c" || equation[0] == "i") {
      if (wasLastTokenAValue) tokens.push("**");
      wasLastTokenAValue = true;

      tokens.push(equation[0]);
      equation = equation.slice(1);
    } else if ((match = equation.match(/^[-+*\/^()]/))) {
      if (wasLastTokenAValue && match[0] == "(") tokens.push("**");
      wasLastTokenAValue = false;

      tokens.push(match[0]);
      equation = equation.slice(1);
    } else equation = equation.slice(1);
  }

  let outputQueue: (string | number)[] = [];
  let operatorStack: string[] = [];
  let token;

  while ((token = tokens.shift())) {
    console.log(outputQueue, operatorStack, token);

    if (
      typeof token == "number" ||
      token == "z" ||
      token == "c" ||
      token == "i" ||
      token == "pi"
    ) {
      outputQueue.push(token);
    } else if (token == ")") {
      while (operatorStack.at(-1) != "(") {
        let o2 = operatorStack.at(-1);
        if (!o2) return ["z"];

        operatorStack.pop();
        outputQueue.push(o2);
      }

      if (operatorStack.pop() != "(") return ["z"];

      let top = operatorStack.at(-1);
      if (!top) continue;
      if (isFunc(top)) {
        operatorStack.pop();
        outputQueue.push(top);
      }
    } else if (token == "(" || isFunc(token)) {
      operatorStack.push(token);
    } else {
      let o1 = token;
      let o2;

      while ((o2 = operatorStack.at(-1)) && o2 != "(") {
        let level1 = levelOf(o1);
        let level2 = levelOf(o2);

        if (!(level2 > level1 || (level1 == level2 && assocOf(o1) == "l")))
          break;

        outputQueue.push((operatorStack.pop(), o2));
      }

      operatorStack.push(o1);
    }
  }

  while ((token = operatorStack.pop())) {
    if (token == "(" || token == ")") return ["z"];
    outputQueue.push(token);
  }

  return outputQueue;
}
