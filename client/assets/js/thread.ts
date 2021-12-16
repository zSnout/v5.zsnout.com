/** A thread used to exchange messages with a worker. */
export interface Thread<R = any, S = R> {
  /**
   * Sends some data to the worker.
   * @param data The data to send.
   */
  send(data: S): void;

  /** Kills the worker immediately. */
  kill(): void;

  /** A receiver that contains all data from the thread. */
  reciever: AsyncGenerator<R, never>;
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

  let onMessage = () =>
    new Promise<any>(
      (resolve) => (globalThis.onmessage = ({ data }) => resolve(data))
    );

  async function* reciever(): AsyncGenerator<any, never> {
    while (true) {
      let data = await onMessage();
      yield data;
    }
  }

  return {
    kill,
    send,
    reciever: reciever(),
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
 * Starts a new worker thread using a function.
 * @param func The function to run inside the worker.
 * @returns A Thread that can be used to exchange messages with the worker.
 */
export default function thread<R, S = R>(
  func: ((thread: Thread<R, S>) => void) | string
): Thread<S, R> {
  let blob = makeWorkerBlob(func);
  let url = URL.createObjectURL(blob);
  let worker = new Worker(url);

  let onMessage = () =>
    new Promise<any>(
      (resolve) => (worker.onmessage = ({ data }) => resolve(data))
    );

  async function* reciever(): AsyncGenerator<S, never> {
    while (true) {
      yield await onMessage();
    }
  }

  return {
    send: (data: R) => worker.postMessage(data),
    kill: () => worker.terminate(),
    reciever: reciever(),
  };
}
