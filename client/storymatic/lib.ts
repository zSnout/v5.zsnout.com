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
// key
// if
// context
// repeat
// while
// for
// step
// run
// switch
// randint
// floor
// ceil
// store
// load

/** Represents an action in a script. */
export type Action =
  | { type: "print"; content: Expression[] }
  | {
      type: "variable";
      name: string;
      mode: "=" | "+=" | "-=" | "*=" | "/=" | "%=";
      value: Expression[];
    }
  // defining a function
  | {
      type: "function";
      name: string;
      args: string[];
      block: Action[];
    }
  // calling a function
  | {
      type: "command";
      name: string;
      args: Expression[][];
      block: Action[] | null;
    }
  | {
      type: "if" | "elif" | "unless" | "while" | "until";
      cond: Expression[];
      block: Action[];
    }
  | { type: "else"; block: Action[] }
  | { type: "each"; name: string; value: Expression[]; block: Action[] }
  | { type: "let"; name: string; value: Expression[] }
  | { type: "return"; value: Expression[] };

/** An expression token. */
export type Expression =
  | Expression[]
  | { type: "command"; name: string; arg: Expression[][] }
  | { type: "variable"; name: string }
  | { type: "string"; content: (string | { type: "variable"; name: string })[] }
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
  | "=="
  | "!="
  | "<="
  | ">="
  | "&&"
  | "||"
  | ",";

/** An array containing a single line of content along with its indentation level. */
export type Indented = [level: number, content: string];

/** An array containing multiple lines of content along with their indentation level. */
export type MultiIndent = [level: number, content: string[]];

/** An array containing a parsed script. */
export type Group = (string | Group)[];

/**
 * Gets the indentation levels of different lines in a script.
 * @param script The script to parse.
 * @returns A list of strings with their indentation levels.
 */
export function getIndentsOf(script: string): Indented[] {
  return script
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
    } else if (
      (match = e.match(/^\$([\w_][\w\d_]*)\s*([+*%\/\-]=|=)\s*(.+)$/))
    ) {
      actions.push({
        type: "variable",
        name: match[1],
        mode: match[2] as any,
        value: parseExpr(match[3]),
      });
    } else if ((match = e.match(/^@([\w_][\w\d_]*)\s*(.*)$/))) {
      let block: Action[] | null = null;

      let submatch;
      if ((submatch = match[2].match(/^\(([^\)]+)\)\s*(.*)$/))) {
        actions.push({
          type: "command",
          name: match[1],
          args: submatch[1] ? splitOnComma(parseExpr(match[1])) : [],
          block: submatch[2] ? parseActionGroups([submatch[2]]) : null,
        });
      }

      if (typeof groups[i + 1] == "object") {
        block = parseActionGroups(groups[i + 1] as Group);
        i++;
      }

      actions.push({
        type: "command",
        name: match[1],
        args: match[2] ? splitOnComma(parseExpr(match[2])) : [],
        block,
      });
    } else if ((match = e.match(/^(if|elif|unless|while|until)\s+(.+)$/))) {
      let block: Action[] = [];

      if (typeof groups[i + 1] == "object") {
        block = parseActionGroups(groups[i + 1] as Group);
        i++;
      }

      actions.push({
        type: match[1] as "if" | "elif" | "unless" | "while" | "until",
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
    } else if ((match = e.match(/^let\s+\$([\w_][\w\d_]*)(?:\s*=\s*(.+))?/))) {
      let val: Expression[] = [{ type: "null" }];
      if (match[2]) val = parseExpr(match[2]);

      actions.push({
        type: "let",
        name: match[1],
        value: val,
      });
    } else if (
      (match = e.match(/^(?:func|function|def)\s+@([\w_][\w\d_]*)(?:\s+(.+))?/))
    ) {
      let args = match[2]
        .split(/\s+/)
        .map((e) => e.match(/^\$([\w_][\w\d_]*)$/))
        .map((e) => e?.[1])
        .filter((e): e is string => !!e);

      let block: Action[];
      let group = groups[i + 1];
      if (typeof group == "object") {
        block = parseActionGroups(group);
        i++;
      } else continue;

      actions.push({
        type: "function",
        name: match[1],
        args,
        block,
      });
    } else if ((match = e.match(/^(return)(?:\s+(.+))?/))) {
      let val: Expression[] = [{ type: "null" }];
      if (match[2]) val = parseExpr(match[2]);

      actions.push({
        type: match[1] as "return",
        value: val,
      });
    } else actions.push({ type: "print", content: parseExpr(e) });
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
 * @returns A list of tokens in that expression.
 */
export function parseExpr(expr: string): Expression[] {
  let tokens: Expression[] = [];
  let quote: false | (string | { type: "variable"; name: string })[] = false;
  let quoteMark: '"' | "'" | null = null;
  let twochars = ["<=", ">=", "!=", "=="];
  let chars = ["+", "-", "*", "/", "%", ">", "<", "(", ")", "[", "]", ","];

  while ((expr = quote ? expr : expr.trim())) {
    let match;

    if (quote) {
      if (expr[0] == quoteMark) {
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
      } else if ((match = expr.match(/^\$([\w_][\w\d_]*)([^\w\d_].*|$)$/))) {
        quote.push({ type: "variable", name: match[1] });
        expr = match[2];
      } else {
        quote.push(expr[0]);
        expr = expr.slice(1);
      }
    } else if ((match = expr.match(/^\$([\w_][\w\d_]*)([^\w\d_].*|$)$/))) {
      tokens.push({ type: "variable", name: match[1] });
      expr = match[2];
    } else if ((match = expr.match(/^@([\w_][\w\d_]*)([^\w\d_].*|$)$/))) {
      tokens.push({ type: "command", name: match[1], arg: [] });
      expr = match[2];
    } else if (twochars.includes(expr.slice(0, 2))) {
      tokens.push(expr.slice(0, 2) as Expression);
      expr = expr.slice(2);
    } else if (chars.includes(expr[0])) {
      tokens.push(expr[0] as Expression);
      expr = expr.slice(1);
    } else if (expr[0] == "=") {
      tokens.push("==");
      expr = expr.slice(1);
    } else if (
      (match = expr.match(/^(is not|isnt|is|not|and|or)([^\w\d_].*|$)$/))
    ) {
      let phrase = match[1] as "is not" | "isnt" | "is" | "not" | "and" | "or";

      switch (phrase) {
        case "is not":
        case "isnt":
          tokens.push("!=");
          break;

        case "is":
          tokens.push("==");
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
    } else if ((match = expr.match(/^(\d+(?:\.\d+)?)([^\w\d_].*|$)$/))) {
      let number = parseFloat(match[1]);
      if (!Number.isNaN(number)) tokens.push({ type: "number", value: number });
      expr = match[2];
    } else if ((match = expr.match(/^(true|false|yes|no)([^\w\d_].*|$)$/))) {
      let bool = match[1] == "true" || match[1] == "yes" ? true : false;
      tokens.push({ type: "boolean", value: bool });
      expr = match[2];
    } else if ((match = expr.match(/^null([^\w\d_].*|$)$/))) {
      tokens.push({ type: "null" });
      expr = match[2];
    } else if (expr[0] == '"' || expr[0] == "'") {
      quote = [];
      quoteMark = expr[0];
      expr = expr.slice(1);
    } else return [];
  }

  let current: Expression[] = [];
  let groups: Expression[][] = [current];

  for (let token of tokens) {
    if (token == "(") {
      current = [];
      groups.push(current);
    } else if (token == ")") {
      let last = groups.pop();
      if (!last) return [];

      current = groups[groups.length - 1];
      if (!current) return [];
      current.push(last);
    } else current.push(token);
  }

  let val = groups[0];
  if (!val) return [];
  if (!val.length) return [];

  function checkAll(val: Expression[]) {
    for (let index = 0; index < val.length; index++) {
      let e = val[index];

      if (typeof e != "object") continue;
      if (Array.isArray(e)) {
        checkAll(e);
        continue;
      }

      if (e.type == "command") {
        let n = val[index + 1];

        if (Array.isArray(n)) {
          checkAll(n);
          e.arg = splitOnComma(n);
          index++;
          val.splice(index, 1);
        } else {
          e.arg = splitOnComma(val.splice(index + 1));
          break;
        }
      }
    }
  }

  checkAll(val);
  return val;
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
 * Converts an expression to JavaScript code.
 * @param expr The expression to convert.
 * @returns The expression as JavaScript code.
 */
export function exprToJS(exprs: Expression[]): string {
  let code = "";

  for (let expr of exprs) {
    if (Array.isArray(expr)) code += ` ( ${exprToJS(expr)} ) `;
    else if (typeof expr == "string") code += ` ${expr} `;
    else if (expr.type == "number") code += ` ${expr.value} `;
    else if (expr.type == "boolean") code += ` ${expr.value} `;
    else if (expr.type == "null") code += ` null `;
    else if (expr.type == "variable") code += ` $${expr.name} `;
    else if (expr.type == "command")
      code += ` ( await $${expr.name}( [ ${expr.arg
        .map(exprToJS)
        .join(" , ")} ] ) ) `;
    else if (expr.type == "string")
      code += ` \`${expr.content
        .map((el) => {
          if (typeof el == "string")
            return el
              .replace(/\\/g, "\\\\")
              .replace(/`/g, "\\`")
              .replace(/\$/g, "\\$")
              .replace(/{/g, "\\{");
          else if (el.type == "variable") return `$\{$${el.name}}`;
        })
        .join("")}\` `;
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
        code += `_print( ${exprToJS(action.content)} ); `;
        break;

      case "variable":
        code += `$${action.name} ${action.mode} ${exprToJS(action.value)}; `;
        break;

      case "let":
        code += `let $${action.name} = ${exprToJS(action.value)}; `;
        break;

      case "function":
        code += `async function $${action.name}( [ ${action.args
          .map((e) => `$${e}`)
          .join(" , ")} ] = [] ) { ${actionToJS(action.block)} } `;
        break;

      case "command":
        if (action.block)
          code += `await $${action.name}( [ ${action.args
            .map(exprToJS)
            .join(" , ")} ], async function () { ${actionToJS(
            action.block
          )} } ); `;
        else
          code += `$${action.name}( [ ${action.args
            .map(exprToJS)
            .join(" , ")} ] ); `;
        break;

      case "if":
      case "while":
        code += `${action.type} ( ${exprToJS(action.cond)} ) { ${actionToJS(
          action.block
        )} } `;
        break;

      case "unless":
        code += `if ( ! ( ${exprToJS(action.cond)} ) ) { ${actionToJS(
          action.block
        )} } `;
        break;

      case "until":
        code += `while ( ! ( ${exprToJS(action.cond)} ) ) { ${actionToJS(
          action.block
        )} } `;
        break;

      case "elif":
        code += `else if ( ${exprToJS(action.cond)} ) { ${actionToJS(
          action.block
        )} } `;
        break;

      case "else":
        code += `else { ${actionToJS(action.block)} } `;
        break;

      case "return":
        code += `return ${exprToJS(action.value)}; `;
        break;

      case "each":
        code += `for (let $${action.name} of ${exprToJS(
          action.value
        )}) { ${actionToJS(action.block)} } `;
        break;
    }
  }

  return code.replace(/\s+/g, " ").trim();
}
