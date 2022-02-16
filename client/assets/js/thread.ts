/** Inverts the types of a `Thread`. */
export type InvertThread<T extends Thread> = T extends Thread<
  infer Recievable,
  infer Sendable
>
  ? Thread<Sendable, Recievable>
  : never;

/** A thread used to exchange messages with a worker. */
export interface Thread<Recievable = any, Sendable = Recievable> {
  /**
   * Sends some data to the worker.
   * @param data The data to send.
   */
  send(data: Sendable): void;

  /** Kills the worker immediately. */
  kill(): void;

  /** Returns a boolean indicating whether the worker is active. Will always return `true` in a worker. */
  isAlive(): boolean;

  /** A receiver that contains all data from the thread. */
  reciever: AsyncGenerator<Recievable, never>;
}

/**
 * Meant to be run inside a worker thread. Prepares the worker for execution.
 * @returns A thread object used inside the worker.
 */
function prepareWorker(): Thread {
  let send = globalThis.postMessage.bind(globalThis);
  let kill = globalThis.close.bind(globalThis);
  delete (globalThis as any).postMessage;
  delete (globalThis as any).close;

  async function* reciever(): AsyncGenerator<any, never> {
    while (true) {
      let data = await new Promise<any>(
        (resolve) => (globalThis.onmessage = ({ data }) => resolve(data))
      );
      yield data;
    }
  }

  return {
    kill,
    send,
    reciever: reciever(),
    isAlive: () => true,
  };
}

/**
 * Creates a Blob containing the worker code.
 * @param func The function to run inside the worker.
 * @returns A Blob containing the worker code.
 */
function makeWorkerBlob(func: ((thread: Thread) => void) | string): Blob {
  return new Blob([`(${func})(${prepareWorker}())`], {
    type: "text/javascript",
  });
}

/**
 * Starts a new worker thread using a function or existing Worker.
 * @param func The function to run inside the worker.
 * @returns A Thread that can be used to exchange messages with the worker.
 */
export default function thread<R, S = R>(
  func: ((thread: Thread<R, S>) => void) | Worker | string
): Thread<S, R> {
  let worker: Worker;
  if (typeof func == "function" || typeof func == "string") {
    let blob = makeWorkerBlob(func);
    let url = URL.createObjectURL(blob);
    worker = new Worker(url);
  } else {
    worker = func;
  }

  async function* reciever(): AsyncGenerator<S, never, never> {
    while (true) {
      yield new Promise<any>(
        (resolve) => (worker.onmessage = ({ data }) => resolve(data))
      );
    }
  }

  let isAlive = true;

  return {
    send: (data: R) => worker.postMessage(data),
    kill: () => ((isAlive = false), worker.terminate()),
    reciever: reciever(),
    isAlive: () => isAlive,
  };
}
