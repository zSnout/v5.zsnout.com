import $, { jsx, zQuery } from "../assets/js/jsx.js";
import thread, { Thread } from "../assets/js/thread.js";
import { storyToJS } from "./lib.js";

/** The type of a script message. */
type ScriptMessage =
  | { type: "field"; value: string }
  | { type: "menu"; index: number }
  | { type: "submit" };

/** The type of a worker message. */
type WorkerMessage =
  | { type: "text"; content: string }
  | { type: "menu"; items: string[]; query?: string }
  | { type: "line" }
  | { type: "clear" }
  | { type: "kill"; error?: string };

/**
 * The main Storymatic worker.
 * @param thread The thread this worker interacts with.
 */
async function smWorker(thread: Thread<ScriptMessage, WorkerMessage>) {
  function _print(...data: any[]) {
    data
      .filter(
        (e) =>
          typeof e != "undefined" &&
          typeof e != "object" &&
          typeof e != "function"
      )
      .map((data) => thread.send({ type: "text", content: data }));
  }

  async function $json([data]: [any?] = []) {
    return JSON.parse(data);
  }

  async function $input([data]: [any?] = []) {
    _print(data);

    while (true) {
      let { value } = await thread.reciever.next();

      if (value.type == "field") {
        return value.value;
      }
    }
  }

  async function $inputnum([data]: [any?] = []) {
    _print(data);

    while (true) {
      let { value } = await thread.reciever.next();

      if (value.type == "field") {
        let num = +value.value;
        if (Number.isNaN(num)) _print("Sorry, you have to use a number!");
        else return value.value;
      }
    }
  }

  async function $yesno([data]: [any?] = []) {
    _print(data);

    while (true) {
      let { value } = await thread.reciever.next();

      if (value.type == "field") {
        let val = value.value.toLowerCase().trim();
        if (val == "true" || val == "yes" || val == "y") return true;
        if (val == "false" || val == "no" || val == "n") return false;

        _print("Sorry, you need to write 'yes' or 'no'!");
      }
    }
  }

  async function $kill([data]: [any?] = []) {
    if (data === null || typeof data == "undefined" || data === "")
      thread.send({ type: "kill" });

    thread.send({ type: "kill", error: String(data) });

    return new Promise<void>(() => {});
  }

  function $wait([ms]: [any?] = []) {
    ms = +ms;
    if (Number.isNaN(ms)) return;

    return new Promise((resolve) => setTimeout(resolve, 1000 * ms));
  }

  function $random([min, max]: [any?, any?] = [0, 1]) {
    min = +min;
    max = +max;

    if (Number.isNaN(min) || Number.isNaN(max)) return;

    return Math.random() * (max - min) + min;
  }

  function $randint([min, max]: [any?, any?] = [0, 9]) {
    min = +min;
    max = +max;

    if (Number.isNaN(min) || Number.isNaN(max)) return;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function* $range([min, max]: [any?, any?] = [1, NaN]) {
    min = +min;
    max = +max;

    if (Number.isNaN(min)) return;
    if (Number.isNaN(max)) {
      [max, min] = [min, 0];
    }

    for (let i = min; i <= max; i++) {
      yield i;
    }
  }

  let menu: [option: string, callback: Function][] = [];
  async function $menu([data]: [any?] = [], init?: Function) {
    if (!init) return;

    let myMenu: [option: string, callback: Function][] = (menu = []);
    await init();

    thread.send({
      type: "menu",
      query: data ? String(data) : undefined,
      items: myMenu.map(([option]) => option),
    });

    while (true) {
      let { value } = await thread.reciever.next();

      if (value.type == "menu") {
        await myMenu[value.index]?.[1]?.();
        break;
      }
    }
  }

  async function $option([data]: [any?] = [], callback?: Function) {
    if ((!data && data !== false && data !== 0) || !callback) return;
    menu.push([String(data), callback]);
  }

  async function $line() {
    thread.send({ type: "line" });
  }

  async function $pause() {
    while (true) {
      let {
        value: { type },
      } = await thread.reciever.next();

      if (type == "field" || type == "submit") break;
    }
  }

  async function $clear() {
    thread.send({ type: "clear" });
  }

  // This section prevents UglifyJS from removing the functions defined above.
  // We need to call each twice so Uglify doesn't inline them.
  if (Math.random() == Math.random()) {
    _print();
    _print();

    $json();
    $json();

    $input();
    $input();

    $kill();
    $kill();

    $wait();
    $wait();

    $random();
    $random();

    $randint();
    $randint();

    $range();
    $range();

    $menu();
    $menu();

    $option();
    $option();

    $line();
    $line();

    $pause();
    $pause();

    $clear();
    $clear();

    $inputnum();
    $inputnum();

    $yesno();
    $yesno();
  }
}

/** The return type of `createViewer`. */
export interface SMViewer {
  /** The field for user input. */
  field: zQuery;

  /** The form containing `field`. */
  form: zQuery;

  /** The area where messages are outputted. */
  output: zQuery;

  /** The element containing `form` and `output` */
  element: zQuery;

  /** The thread for the Storymatic worker. */
  thread: Thread<WorkerMessage, ScriptMessage>;
}

/**
 * Creates a viewer for a Storymatic program.
 * @param code The Storymatic code.
 * @returns An object with info about the viewer.
 */
export function createViewer(
  code: string,
  {
    field = <input autocomplete="off" className="sm-field" />,
    form = <form className="sm-form" />,
    output = <div className="sm-output" />,
    element = <div className="sm-viewer" />,
  }: Partial<Omit<SMViewer, "thread">> = {}
): SMViewer {
  // The worker code is sliced to remove the ending }
  // We need to do this to stick extra code in the middle
  // We re-add the } at the end of the paragraph
  let worker: Thread<WorkerMessage, ScriptMessage> = thread(`
    ${smWorker.toString().slice(0, -1)}
    $clear();

    try {
      ${storyToJS(code)}
    } catch (e) {
      $kill(["An error occured while running this program! " + (e?.message || e)]);
    }

    $kill();
  }`);

  form.append(field);
  output.empty();
  element.append(output, form);

  appendAndScroll(
    <p className="special">
      If you see this message, the program failed to run. Check that your syntax
      is correct.
    </p>,
    output
  );

  form.on("submit", (event) => {
    event.preventDefault();

    if (field.val()) {
      worker.send({ type: "field", value: field.val() });
      appendAndScroll(<p className="user">{field.val()}</p>, output);
      field.val("");
    } else worker.send({ type: "submit" });
  });

  (async () => {
    for await (let data of worker.reciever) {
      if (data.type == "kill") {
        if (data.error) {
          appendAndScroll(<p className="special">{data.error}</p>, output);
        }

        worker.kill();
        break;
      }

      if (data.type == "text") {
        appendAndScroll(makeTag(data.content), output);
      } else if (data.type == "line") {
        appendAndScroll(<hr />, output);
      } else if (data.type == "clear") {
        output.empty();
      } else if (data.type == "menu") {
        function send(index: number) {
          worker?.send?.({ type: "menu", index });
          menu.children().each((el) => ((el as any).disabled = true));
          $(menu.children()[index]).addClass("selected");
        }

        let menu = makeTag(data.query ? data.query + " " : "");
        menu.addClass("menu");
        menu.append(
          ...data.items.map((option, index) => (
            <button onClick={() => send(index)}>{option}</button>
          ))
        );

        appendAndScroll(menu, output);
      }
    }
  })();

  return { form, field, output, element, thread: worker };
}

/**
 * Appends an element to output and scrolls to the bottom if near it.
 * @param el The element to append.
 * @param to The element to append to.
 */
function appendAndScroll(el: zQuery, to: zQuery) {
  let isNearBottom = to.isNearBottom();
  to.append(el);

  if (isNearBottom) to.scrollToBottom();
}

/**
 * Converts some data to a JSX element.
 * @param data The data to convert.
 * @returns The data as a JSX element.
 */
function makeTag(data: string) {
  let tag = <p>{data}</p>;
  let isBold = false;
  let isItalic = false;

  tag.html(
    tag.html().replace(/[_*]/g, (match) => {
      if (match == "_") isItalic = !isItalic;
      if (match == "*") isBold = !isBold;

      if (match == "*") return `<${isBold ? "" : "/"}b>`;
      if (match == "_") return `<${isItalic ? "" : "/"}i>`;
      return "";
    })
  );

  return tag;
}
