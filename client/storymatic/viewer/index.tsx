import $, { jsx } from "../../assets/js/jsx.js";
import thread, { Thread } from "../../assets/js/thread.js";
import { storyToJS } from "../lib.js";

type ScriptMessage = {
  type: "field";
  value: string;
};

type WorkerMessage =
  | {
      type: "text";
      content: string;
    }
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

    if (data.type == "text") output.prepend(<p>{data.content}</p>);
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
