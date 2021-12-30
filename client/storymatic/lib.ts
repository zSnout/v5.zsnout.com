// List Of Commands
// pause
// wait
// menu
// choice
// typewrite
// line
// clear
// center
// tooltip
// input
// step
// run
// randint
// floor
// ceil
// store
// load

/** Represents an action in a script. */
export type Action =
  | { type: "print"; content: Expression[] }
  | { type: "define"; name: string; args: Expression[]; block: Action[] }
  | {
      type: "command";
      name: string;
      args: Expression[][];
      block: Action[] | null;
    }
  | {
      type: "variable";
      name: VarExpr[];
      mode: "=" | "+=" | "-=" | "*=" | "/=" | "%=";
      value: Expression[];
    }
  | {
      type: "if" | "elif" | "unless" | "while" | "until" | "repeat";
      cond: Expression[];
      block: Action[];
    }
  | { type: "else"; block: Action[] }
  | { type: "each"; name: string; value: Expression[]; block: Action[] }
  | { type: "let"; name: VarExpr[]; value: Expression[] }
  | { type: "return"; value: Expression[] }
  | { type: "break" | "continue" };

/** A variable token. */
export type VarExpr = Extract<
  Expression,
  { type: "variable" | "bracket" | "propertyaccess" }
>;

/** Data representing a variable. */
export type Variable = {
  name: VarExpr[];
  mode: "=" | "+=" | "-=" | "*=" | "/=" | "%=";
  value: Expression[];
};

/** A string token. */
export type StringExpr =
  | string
  | { type: "variable"; name: string }
  | { type: "embedded"; expr: Expression[] };

/** An expression token. */
export type Expression =
  | { type: "paren"; items: Expression[] }
  | { type: "bracket"; items: Expression[] }
  | { type: "brace"; items: Expression[] }
  | { type: "command"; name: string; arg: Expression[][] }
  | { type: "propertyaccess"; name: string }
  | { type: "objectproperty"; name: string }
  | { type: "variable"; name: string }
  | { type: "string"; content: StringExpr[] }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "null" }
  | "("
  | ")"
  | "["
  | "]"
  | "!"
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "<"
  | ">"
  | "==="
  | "!=="
  | "<="
  | ">="
  | "&&"
  | "||"
  | ","
  | "{"
  | "}";

/** A type of nested expression (parentheses, brackets, braces, etc.) */
export type SubExpression = Extract<Expression, { items: any[] }>;

/** An array containing a single line of content along with its indentation level. */
export type Indented = [level: number, content: string];

/** An array containing multiple lines of content along with their indentation level. */
export type MultiIndent = [level: number, content: string[]];

/** An array containing a parsed script. */
export type Group = (string | Group)[];

/**
 * Takes a script and removes newlines between parentheses, brackets, and braces.
 * It also checks for semicolons and splits them into newlines.
 * @param script The script to check.
 * @returns The reduced script.
 */
export function reduceMultiLineParens(script: string): string {
  let level = 0;
  let isQuote = false;
  let result = [];
  let current = "";
  let ignoreSpace = false;

  for (let row of script.split("\n")) {
    for (let char of row) {
      if (ignoreSpace) {
        if (char == " ") continue;

        ignoreSpace = false;
      }

      if (char == "|") level += isQuote ? 1 : -1;
      if (char == '"') level += isQuote ? -1 : 1;
      if (char == "|" || char == '"') isQuote = !isQuote;

      if (!isQuote) {
        if (char == "(" || char == "[" || char == "{") level++;
        if (char == ")" || char == "]" || char == "}") level--;
      }

      if (level < 0) {
        level = 0;
        char = "";
      }

      if (level == 0 && char == ";") {
        let spaces = current.match(/^\s*/)![0];
        result.push(current);
        current = spaces;

        if (result[result.length - 1].match(/^\s*[A-Za-z]/)) current += " ";

        char = "";
        ignoreSpace = true;
      }

      current += char;
    }

    if (level == 0) {
      result.push(current);
      current = "";
    }
  }

  if (current) result.push(current);

  return result.join("\n");
}

/**
 * Gets the indentation levels of different lines in a script.
 * @param script The script to parse.
 * @returns A list of strings with their indentation levels.
 */
export function getIndentsOf(script: string): Indented[] {
  return reduceMultiLineParens(script)
    .split("\n")
    .filter((e) => e.trim())
    .map((e) => e.trimEnd())
    .map((e): Indented => [e.length - e.trimStart().length, e.trimStart()]);
}

/**
 * Groups lines in a script by their indentation level.
 * @param script The script to parse.
 * @returns A list of strings with their indentation levels.
 */
export function groupByIndent(script: string): MultiIndent[] {
  let indent = 0;
  let group: string[] = [];
  let groups: MultiIndent[] = [];

  for (let [level, content] of getIndentsOf(script)) {
    if (level != indent) {
      if (group.length) groups.push([indent, group]);
      indent = level;
      group = [content];
    } else group.push(content);
  }
  if (group.length) groups.push([indent, group]);

  return groups;
}

/**
 * Parses an indented script into a list of nested strings.
 * @param script The script to parse.
 * @returns An array containing the parsed script.
 */
export function getGroupsOf(script: string): Group {
  let indent = 0;
  let group: Group[] = [];

  for (let [level, content] of groupByIndent(script)) {
    group[level] ??= [];

    if (level >= indent) {
      group[level].push(...content);
    } else if (level < indent) {
      for (let i = group.length - 1; i > level; i--) {
        if (!group[i]) continue;

        group[i - 1] ??= [];
        if (
          typeof group[i] == "object" &&
          group[i].every((e) => typeof e == "object")
        ) {
          group[i - 1].push(...group[i]);
        } else group[i - 1].push(group[i]);

        group.length = i;
      }

      group[level].push(...content);
    }

    indent = level;
  }

  for (let i = group.length - 1; i > 0; i--) {
    if (!group[i]) continue;

    group[i - 1] ??= [];
    if (
      typeof group[i] == "object" &&
      group[i].every((e) => typeof e == "object")
    ) {
      group[i - 1].push(...group[i]);
    } else group[i - 1].push(group[i]);

    group.length = i;
  }

  return group[0] || [];
}

/**
 * Attempts to parse an expression as a variable update.
 * @param expr The expression to parse.
 * @returns Information about the parsed expression.
 */
export function parseVariableExpr(expr: string): Variable | null {
  let parsed = parseExpr(expr);
  let variable: VarExpr[] = [];
  let isFirst = true;

  for (let token of parsed) {
    if (typeof token != "object") break;

    if (
      (token.type == "variable" && isFirst) ||
      token.type == "bracket" ||
      token.type == "propertyaccess"
    )
      variable.push(token);
    else {
      break;
    }

    isFirst = false;
  }

  if (variable.length == parsed.length)
    return { name: variable, mode: "=", value: [{ type: "null" }] };

  let mode: Variable["mode"] = "=";

  let premode = parsed[variable.length];
  if (
    premode == "+" ||
    premode == "-" ||
    premode == "*" ||
    premode == "/" ||
    premode == "%"
  )
    mode = `${premode}=`;

  // Checks if the item after the variable is an equals sign.
  // We need to use `mode != "="` to ensure that we check the next
  // sign if we used a + sign to get the mode.
  if (parsed[variable.length + +(mode != "=")] != "===") return null;

  let value = parsed.slice(variable.length + +(mode != "=") + 1);
  value = value.length ? value : [{ type: "null" }];

  return { mode, value, name: variable };
}

/**
 * Parses a set of groups into a list of actions.
 * @param groups The groups to parse.
 * @returns A list of actions.
 */
export function parseActionGroups(groups: Group): Action[] {
  let actions: Action[] = [];

  for (let i = 0; i < groups.length; i++) {
    let e = groups[i];

    if (typeof e == "object") {
      actions.push(...parseActionGroups(e));
      continue;
    }

    let match;
    if (e.startsWith("#")) {
      continue;
    } else if ((match = e.match(/^@([\w_][\w\d_]*)\s*(.*)$/))) {
      let block: Action[] | null = null;
      let expr = match[2] ? parseExpr(match[2]) : [];
      let first: Expression | undefined = expr[0];

      if (typeof first == "object" && first.type == "paren") {
        let block: Action[] | null = null;

        if (expr.slice(1).length)
          block = [{ type: "print", content: expr.slice(1) }];

        actions.push({
          type: "command",
          name: match[1],
          args: splitOnComma(first.items),
          block,
        });

        continue;
      }

      if (typeof groups[i + 1] == "object") {
        block = parseActionGroups(groups[i + 1] as Group);
        i++;
      }

      actions.push({
        type: "command",
        name: match[1],
        args: splitOnComma(expr),
        block,
      });
    } else if ((match = e.match(/^repeat$/))) {
      let block: Action[] = [];

      if (typeof groups[i + 1] == "object") {
        block = parseActionGroups(groups[i + 1] as Group);
        i++;
      }

      actions.push({
        type: "while",
        cond: [{ type: "boolean", value: true }],
        block,
      });
    } else if (
      (match = e.match(
        /^(if|elif|else if|unless|while|until|repeat)\b\s*(.+)$/
      ))
    ) {
      let block: Action[] = [];

      if (typeof groups[i + 1] == "object") {
        block = parseActionGroups(groups[i + 1] as Group);
        i++;
      }

      if (match[1] == "else if") match[1] = "elif";

      actions.push({
        type: match[1] as
          | "if"
          | "elif"
          | "unless"
          | "while"
          | "until"
          | "repeat",
        cond: parseExpr(match[2]),
        block,
      });
    } else if (
      (match = e.match(/^each\s+\$([\w_][\w\d_]*)\s+(?:in|of)\s+(.*)$/))
    ) {
      let block: Action[] = [];

      if (typeof groups[i + 1] == "object") {
        block = parseActionGroups(groups[i + 1] as Group);
        i++;
      }

      actions.push({
        type: "each",
        name: match[1],
        value: parseExpr(match[2]),
        block,
      });
    } else if ((match = e.match(/^else$/))) {
      let block: Action[] = [];

      if (typeof groups[i + 1] == "object") {
        block = parseActionGroups(groups[i + 1] as Group);
        i++;
      }

      actions.push({
        type: "else",
        block,
      });
    } else if ((match = e.match(/^(break|continue)$/))) {
      actions.push({
        type: match[1] as "break" | "continue",
      });
    } else if ((match = e.match(/^let\s*\b(.+)/))) {
      let parsed = parseVariableExpr(match[1]);
      if (!parsed) continue;

      let first = parsed.value[0];

      if (
        parsed.value.length == 1 &&
        typeof first == "object" &&
        first.type == "null"
      ) {
        let expr = parseExpr(match[1]);

        for (let token of expr) {
          if (typeof token == "object" && token.type == "variable")
            actions.push({
              type: "let",
              name: [token],
              value: [{ type: "null" }],
            });
        }
      } else {
        actions.push({
          type: "let",
          ...parsed,
        });
      }
    } else if (
      (match = e.match(/^(?:func|function|def)\s+@([\w_][\w\d_]*)(?:\s+(.+))?/))
    ) {
      let block: Action[];
      let group = groups[i + 1];
      if (typeof group == "object") {
        block = parseActionGroups(group);
        i++;
      } else continue;

      actions.push({
        type: "define",
        name: match[1],
        args: parseExpr(match[2] || ""),
        block,
      });
    } else if ((match = e.match(/^(return)(?:\s+(.+))?/))) {
      let val: Expression[] = [{ type: "null" }];
      if (match[2]) val = parseExpr(match[2]);

      actions.push({
        type: match[1] as "return",
        value: val,
      });
    } else {
      let parsed = parseVariableExpr(e);
      let expr = parseExpr(e);

      if (parsed && parsed.name.length)
        actions.push({ type: "variable", ...parsed });
      else actions.push({ type: "print", content: expr });
    }
  }

  return actions;
}

/**
 * Splits the expression on commas and returns a list of values.
 * @param val The expression to check.
 * @returns A list of values in the expression.
 */
export function splitOnComma(val: Expression[]): Expression[][] {
  if (!val.length) return [];

  let cur: Expression[] = [];
  let vals: Expression[][] = [cur];

  for (let el of val) {
    if (el == ",") {
      cur = [];
      vals.push(cur);
    } else cur.push(el);
  }

  return vals;
}

/**
 * Converts an expression into a list of tokens.
 * @param expr The expression to parse.
 * @param endOnQuote If true, exits when a quotation mark or `}` is found.
 * @returns A list of tokens in that expression.
 */
export function parseExpr(expr: string): Expression[];
export function parseExpr(
  expr: string,
  parseUntilEmbeddedEnding: true
): [parsed: Expression[], rest: string];
export function parseExpr(
  expr: string,
  parseUntilEmbeddedEnding = false
): Expression[] | [Expression[], string] {
  let tokens: Expression[] = [];
  let quote: false | StringExpr[] = false;
  let twochars = ["<=", ">=", "&&", "||"];
  let chars = ["+", "-", "*", "/", "%", ">", "<", "(", ")", "[", "]", ",", "!", "{", "}"]; // prettier-ignore

  while ((expr = quote ? expr : expr.trim())) {
    let match;

    if (quote) {
      if (expr[0] == '"') {
        let reduced = quote.reduce<typeof quote>((quote, el) => {
          if (
            typeof el == "string" &&
            typeof quote[quote.length - 1] == "string"
          ) {
            quote[quote.length - 1] += el;
          } else quote.push(el);

          return quote;
        }, []);

        tokens.push({ type: "string", content: reduced });
        expr = expr.slice(1);

        quote = false;
      } else if (expr[0] == "\\") {
        quote.push(expr[1]);
        expr = expr.slice(2);
      } else if ((match = expr.match(/^\$(\w+)\b(.*)$/))) {
        quote.push({ type: "variable", name: match[1] });
        expr = match[2];
      } else if (expr[0] == "|") {
        let [parsed, rest] = parseExpr(expr.slice(1), true);
        quote.push({ type: "embedded", expr: parsed });
        expr = rest;
      } else {
        quote.push(expr[0]);
        expr = expr.slice(1);
      }
    } else if ((match = expr.match(/^\.\s*\$?(\w+)\b(.*)$/))) {
      tokens.push({ type: "propertyaccess", name: match[1] });
      expr = match[2];
    } else if ((match = expr.match(/^\$?(\w+)\s*:(.*)$/))) {
      tokens.push({ type: "objectproperty", name: match[1] });
      expr = match[2];
    } else if ((match = expr.match(/^\$(\w+)\b(.*)$/))) {
      tokens.push({ type: "variable", name: match[1] });
      expr = match[2];
    } else if ((match = expr.match(/^@(\w+)\b(.*)$/))) {
      tokens.push({ type: "command", name: match[1], arg: [] });
      expr = match[2];
    } else if (expr[0] == "=" || expr.slice(0, 2) == "==") {
      tokens.push("===");
      expr = expr.slice(1);
    } else if (expr[0] == "!=") {
      tokens.push("!==");
      expr = expr.slice(1);
    } else if (twochars.includes(expr.slice(0, 2))) {
      tokens.push(expr.slice(0, 2) as Expression);
      expr = expr.slice(2);
    } else if (chars.includes(expr[0])) {
      tokens.push(expr[0] as Expression);
      expr = expr.slice(1);
    } else if ((match = expr.match(/^(is not|isnt|is|not|and|or)\b(.*)$/))) {
      let phrase = match[1] as "is not" | "isnt" | "is" | "not" | "and" | "or";

      switch (phrase) {
        case "is not":
        case "isnt":
          tokens.push("!==");
          break;

        case "is":
          tokens.push("===");
          break;

        case "not":
          tokens.push("!");
          break;

        case "and":
          tokens.push("&&");
          break;

        case "or":
          tokens.push("||");
          break;
      }

      expr = match[2];
    } else if ((match = expr.match(/^(\d+(?:\.\d+)?)\b(.*)$/))) {
      let number = parseFloat(match[1]);
      if (!Number.isNaN(number)) tokens.push({ type: "number", value: number });
      expr = match[2];
    } else if ((match = expr.match(/^(true|false|yes|no|on|off|y|n)\b(.*)$/))) {
      let bool =
        match[1] == "true" ||
        match[1] == "yes" ||
        match[1] == "on" ||
        match[1] == "y";

      tokens.push({ type: "boolean", value: bool });
      expr = match[2];
    } else if ((match = expr.match(/^(null)\b(.*)$/))) {
      tokens.push({ type: "null" });
      expr = match[2];
    } else if (expr[0] == "|" && parseUntilEmbeddedEnding) {
      return [tokens, expr.slice(1)];
    } else if (expr[0] == '"') {
      quote = [];
      expr = expr.slice(1);
    } else expr = expr.slice(1);
  }

  let current: SubExpression = { type: "paren", items: [] };
  let groups: SubExpression[] = [current];
  let map = { "(": "paren", "[": "bracket", "{": "brace" } as const;

  for (let token of tokens) {
    if (token == "(" || token == "[" || token == "{") {
      current = { type: map[token], items: [] };
      groups.push(current);
    } else if (token == ")" || token == "]" || token == "}") {
      let last = groups.pop();
      if (!last) return [];

      current = groups[groups.length - 1];
      current.items.push(last);
    } else current.items.push(token);
  }

  let val = groups[0];
  if (!val) return [];
  if (!val.items.length) return [];

  /**
   * Checks a portion of text for command calls.
   * @param val The value to check.
   */
  function checkAll(val: Expression[]) {
    for (let index = 0; index < val.length; index++) {
      let expr = val[index];

      if (typeof expr != "object") continue;
      if ("items" in expr) {
        checkAll(expr.items);
        continue;
      }

      if (expr.type == "command") {
        let next = val[index + 1];

        if (typeof next == "object" && next.type == "paren") {
          checkAll(next.items);
          expr.arg = splitOnComma(next.items);
          index++;
          val.splice(index, 1);
        } else {
          expr.arg = splitOnComma(val.splice(index + 1));
          break;
        }
      }
    }
  }

  checkAll(val.items);
  return val.items;
}

/**
 * Gets a list of commands from a script.
 * @param script The script to parse.
 * @returns The list of commands.
 */
export function parseStory(script: string): Action[] {
  return parseActionGroups(getGroupsOf(script));
}

/**
 * Adds two spaces before each line in the string.
 * @param string The string to indent.
 * @returns An indented string.
 */
export function indent(string: string): string {
  return string
    .split("\n")
    .map((line) => "  " + line)
    .join("\n");
}

/**
 * Converts a string expression to JavaScript code.
 * @param exprs The expression to convert.
 * @returns The expression as JavaScript code.
 */
export function strToJS(exprs: StringExpr[]): string {
  let output = " `";

  for (let expr of exprs) {
    if (typeof expr == "string")
      output += expr
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$")
        .replace(/{/g, "\\{");
    else if (expr.type == "variable") output += `\${ $${expr.name} }`;
    else if (expr.type == "embedded") output += `\${ ${exprToJS(expr.expr)} }`;
  }

  return output + "` ";
}

/**
 * Converts an expression to JavaScript code.
 * @param exprs The expression to convert.
 * @returns The expression as JavaScript code.
 */
export function exprToJS(exprs: Expression[]): string {
  let code = "";

  for (let expr of exprs) {
    if (typeof expr == "string") code += ` ${expr} `;
    else if (expr.type == "paren") code += ` ( ${exprToJS(expr.items)} ) `;
    else if (expr.type == "bracket") code += ` [ ${exprToJS(expr.items)} ] `;
    else if (expr.type == "brace") code += ` { ${exprToJS(expr.items)} } `;
    else if (expr.type == "number") code += ` ${expr.value} `;
    else if (expr.type == "boolean") code += ` ${expr.value} `;
    else if (expr.type == "null") code += ` null `;
    else if (expr.type == "variable") code += ` $${expr.name} `;
    else if (expr.type == "propertyaccess") code += ` .$${expr.name} `;
    else if (expr.type == "objectproperty") code += ` $${expr.name}: `;
    else if (expr.type == "command")
      code += ` ( await $${expr.name}( [ ${expr.arg
        .map(exprToJS)
        .join(" , ")} ] ) ) `;
    else if (expr.type == "string") code += strToJS(expr.content);
  }

  return code.replace(/\s+/g, " ").trim();
}

/**
 * Converts a list of actions to JavaScript code.
 * @param actions The actions to convert.
 * @returns JavaScript code representing the actions.
 */
export function actionToJS(actions: Action[]): string {
  let code = "";

  for (let action of actions) {
    switch (action.type) {
      case "print":
        code += `_print( ${exprToJS(action.content)} );\n`;
        break;

      case "variable":
        code += `${exprToJS(action.name)} ${action.mode} ${exprToJS(
          action.value
        )};\n`;
        break;

      case "continue":
      case "break":
        code += action.type + ";\n";
        break;

      case "let":
        code += `let ${exprToJS(action.name)} = ${exprToJS(action.value)};\n`;
        break;

      case "define":
        code += `async function $${action.name}( [ ${exprToJS(
          action.args
        )} ] = [] ) {\n${indent(actionToJS(action.block))}\n}\n\n`;
        break;

      case "command":
        if (action.block)
          code += `await $${action.name}( [ ${action.args
            .map(exprToJS)
            .join(" , ")} ], async function () {\n${indent(
            actionToJS(action.block)
          )}\n} );\n`;
        else
          code += `await $${action.name}( [ ${action.args
            .map(exprToJS)
            .join(" , ")} ] );\n`;
        break;

      case "if":
      case "while":
        code += `${action.type} ( ${exprToJS(action.cond)} ) {\n${indent(
          actionToJS(action.block)
        )}\n}\n`;
        break;

      case "repeat":
        code += `for ( let _loop of Array( + ( ${exprToJS(
          action.cond
        )} ) ) ) {\n${indent(actionToJS(action.block))}\n}\n`;
        break;

      case "unless":
      case "until":
        code += `${action.type == "unless" ? "if" : "while"} ( ! ( ${exprToJS(
          action.cond
        )} ) ) {\n${indent(actionToJS(action.block))}\n}\n`;
        break;

      case "elif":
        code += `else if ( ${exprToJS(action.cond)} ) {\n${indent(
          actionToJS(action.block)
        )}\n}\n`;
        break;

      case "else":
        code += `else {\n${indent(actionToJS(action.block))}\n}\n`;
        break;

      case "return":
        code += `return ${exprToJS(action.value)};\n`;
        break;

      case "each":
        code += `for (let $${action.name} of ${exprToJS(
          action.value
        )}) {\n${indent(actionToJS(action.block))}\n}\n`;
        break;
    }
  }

  return code
    .split("\n")
    .map((e) => e.replace(/([^ ]) +/gm, "$1 "))
    .join("\n")
    .trim();
}

/**
 * Converts a Storymatic script to JavaScript code.
 * @param script The script to convert.
 * @returns The script as JavaScript code.
 */
export function storyToJS(script: string): string {
  return (
    "// Generated by zSnout Storymatic \n// https://zsnout.com/storymatic/ \n\n" +
    actionToJS(parseStory(script))
  );
}
