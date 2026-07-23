import { isCancelledError } from "@tanstack/react-query";

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError") ||
    isCancelledError(error)
  );
}

export function mergeAbortSignals(
  ...signals: (AbortSignal | undefined)[]
): AbortSignal {
  const controller = new AbortController();

  const abortFrom = (source: AbortSignal) => {
    if (!controller.signal.aborted) {
      controller.abort(source.reason);
    }
  };

  for (const signal of signals) {
    if (!signal) continue;
    if (signal.aborted) {
      abortFrom(signal);
      break;
    }
    signal.addEventListener("abort", () => abortFrom(signal), { once: true });
  }

  return controller.signal;
}

/** Reject as soon as `signal` aborts, without waiting for `promise`. */
export function abortable<T>(
  signal: AbortSignal,
  promise: Promise<T>,
): Promise<T> {
  throwIfAborted(signal);

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    };

    signal.addEventListener("abort", onAbort, { once: true });

    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        if (signal.aborted) {
          reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
          return;
        }
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}
