/** The type of a token or group. */
export type Token =
  | string
  | Token[]
  | { type: "paren" | "abs"; items: Token[] };

/** The type of a list of tokens. */
export type TokenList = Extract<Token, { items: any[] }>;

/** The type of a token returned by {@linkcode parseArithmetic}. */
export type ArithmeticToken =
  | string
  | ArithmeticToken[]
  | { type: "paren" | "abs"; items: ArithmeticTokenList };

/** The type of a token list returned by {@linkcode parseArithmetic}. */
export type ArithmeticTokenList = (
  | (ArithmeticToken[] | "*" | "/")[]
  | "+"
  | "-"
)[];

/** The type of an expression. */
export type Expression = {
  type: "+" | "-" | "*" | "/";
  a: Expression | Token[];
  b: Expression | Token[];
};

/**
 * Parses and groups a piece of text by parentheses and brackets.
 * @param text The text to parse.
 * @returns A list of tokens.
 */
export function parseAndGroup(text: string): Token[] {
  let current: TokenList = { type: "paren", items: [] };
  let groups: TokenList[] = [current];
  let map = { "(": "paren", "[": "abs" } as const;

  for (let char of text) {
    switch (char) {
      case "(":
      case "[":
        current = { type: map[char], items: [] };
        groups.push(current);
        break;

      case ")":
      case "]":
        let last = groups.pop();
        if (!last) return [];
        current = groups[groups.length - 1];
        current.items.push(last);
        break;

      default:
        let item = current.items[current.items.length - 1];
        if (typeof item == "string") {
          current.items[current.items.length - 1] += char;
        } else current.items.push(char);
    }
  }

  return (groups[0] || { items: [] }).items;
}

/**
 * Splits a list of tokens into groups of tokens.
 * @param tokens The tokens to parse.
 * @param splitters The tokens to split on.
 * @returns A list of tokens.
 */
export function splitOnToken(tokens: Token[], ...splitters: string[]): Token[] {
  let current: Token[] = [];
  let groups: Token[] = [current];

  for (let item of tokens) {
    if (typeof item == "string") {
      for (let char of item) {
        if (splitters.includes(char)) {
          groups.push(char);
          groups.push((current = []));
        } else {
          let last = current[current.length - 1];
          if (typeof last == "string") {
            current[current.length - 1] += char;
          } else current.push(char);
        }
      }
    } else if ("items" in item) {
      current.push({
        type: item.type,
        items: splitOnToken(item.items, ...splitters),
      });
    } else current.push(splitOnToken(item, ...splitters));
  }

  return groups;
}

/**
 * Parses some text into arithmetic.
 * @param text The text to parse.
 * @returns A parsed and split list of tokens.
 */
export function parseArithmetic(text: string): ArithmeticTokenList {
  let split = splitOnToken(
    splitOnToken(parseAndGroup(text), "+", "-"),
    "*",
    "/"
  );

  /** Removes the first layer of parentheses added onto the doubly split tokens. */
  function removeFirstLayerParens(tokens: [Token[]]): Token[] {
    return tokens[0].map((item) => {
      if (typeof item == "object" && "items" in item) {
        return {
          type: item.type,
          items: removeFirstLayerParens(item.items as [Token[]]),
        };
      } else if (
        typeof item == "object" &&
        item.length == 1 &&
        Array.isArray(item[0])
      ) {
        return removeFirstLayerParens(item as [Token[]]);
      } else return item;
    });
  }

  split = removeFirstLayerParens(split as [Token[]]);

  function travel(tokens: Token[]): Token[] {
    let current: Token[] = [];
    for (let token of tokens) {
      if (typeof token == "string") {
        type RegexValue =
          | `${"z" | "c"}${"x" | "y" | ""}`
          | "i"
          | `^${2 | 3}`
          | `${"n" | ""}${number}`;

        let items = token.match(
          /[zc][xy]?|[-+*\/]|i|\^[23]|n?\d+(?:\.\d+)?/g
        ) as RegexValue[] | null;
        if (!items) return [];

        current.push(
          ...items.map((item) => {
            if (item.startsWith("n")) return String(+item.slice(1));
            else if (item.match(/^\d/)) return String(+item);
            else return item;
          })
        );
      } else if ("items" in token) {
        current.push({ type: token.type, items: travel(token.items) });
      } else current.push(travel(token));
    }

    return current;
  }

  return travel(split) as ArithmeticTokenList;
}

/**
 *
 * @param tokens The tokens to parse.
 * @returns
 */
export function toExpression(
  tokens: ArithmeticTokenList
): Expression | Token[] {
  let addSubA: Expression | Token[] = tokens[0] as Token[];
  for (let i = 1; i < tokens.length; i += 2) {
    let addSubOp = tokens[i];
    let addSubB = tokens[i + 1];

    if (typeof addSubOp == "string" && typeof addSubB == "object") {
      let multDivA: Expression | Token[] = addSubB[0] as Token[];
      for (let j = 1; j < addSubB.length; j += 2) {
        let multDivOp = addSubB[j];
        let multDivB = addSubB[j + 1];

        if (typeof multDivOp == "string" && typeof multDivB == "object") {
          multDivA = { type: multDivOp, a: multDivA, b: multDivB };
        }
      }

      addSubA = { type: addSubOp, a: addSubA, b: multDivA };
    }
  }

  return addSubA;
}

[[1], "+", [2], "-", [3]];

({
  type: "-",
  a: {
    type: "+",
    a: [1],
    b: [2],
  },
  b: [3],
});
