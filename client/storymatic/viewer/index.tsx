import $, { jsx } from "../../assets/js/jsx.js";
import thread, { Thread } from "../../assets/js/thread.js";
import { storyToJS } from "../lib.js";

type ScriptMessage =
  | { type: "field"; value: string }
  | { type: "menu"; index: number };

type WorkerMessage =
  | { type: "text"; content: string }
  | { type: "line" }
  | { type: "menu"; items: string[]; query?: string }
  | { type: "kill" };

/**
 * The main Storymatic worker.
 * @param thread The thread this worker interacts with.
 */
async function smWorker(thread: Thread<ScriptMessage, WorkerMessage>) {
  function _print(...data: any[]) {
    data
      .filter((e) => e !== null && typeof e != "undefined")
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

  async function $kill() {
    thread.send({ type: "kill" });
    thread.kill();
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
    await thread.reciever.next();
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
  }
}

let field = $("#field");
let output = $("#output");
let worker: Thread<WorkerMessage, ScriptMessage> | null = null;

$("#fieldform").on("submit", (event) => {
  event.preventDefault();

  if (field.val() && worker) {
    worker.send({ type: "field", value: field.val() });
    output.prepend(<p className="user">{field.val()}</p>);
    field.val("");
  } else field.val("");
});

field.focus();

/**
 * Starts a Storymatic program.
 * @param script The script to run.
 */
async function startProgram(script: string) {
  worker?.kill();
  output.empty();

  worker = thread(
    `${smWorker.toString().slice(0, -1)}\n\n${storyToJS(script)}\n$kill()\n}`
  );

  for await (let data of worker.reciever) {
    if (data.type == "kill") {
      worker = null;
      break;
    }

    if (data.type == "text") {
      output.prepend(<p>{data.content}</p>);
    } else if (data.type == "line") {
      output.prepend(<hr />);
    } else if (data.type == "menu") {
      function send(index: number) {
        worker?.send?.({ type: "menu", index });
        menu.children().each((el) => ((el as any).disabled = true));
        $(menu.children()[index]).addClass("selected");
      }

      let menu = <p className="menu">{data.query ? data.query + " " : ""}</p>;
      menu.append(
        ...data.items.map((option, index) => (
          <button onClick={() => send(index)}>{option}</button>
        ))
      );

      output.prepend(menu);
    }
  }
}

/** Checks the window hash and tries to start a Storymatic program from it. */
function checkHash() {
  if (location.hash) {
    try {
      let hash = location.hash.slice(1);
      let script = atob(hash);

      startProgram(script);
    } catch {}
  }
}

checkHash();
window.addEventListener("hashchange", checkHash);
