"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UsePollingOptions<T> = {
  readonly enabled?: boolean;
  readonly interval: number;
  readonly maxInterval: number;
  readonly backoffAfterMs?: number;
  readonly stopWhen: (value: T | undefined) => boolean;
};

export function usePolling<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: UsePollingOptions<T>
) {
  const {
    enabled = true,
    interval,
    maxInterval,
    backoffAfterMs = 30_000,
    stopWhen,
  } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const fnRef = useRef(fn);
  const stopWhenRef = useRef(stopWhen);
  const tickRef = useRef(0);

  fnRef.current = fn;
  stopWhenRef.current = stopWhen;

  const run = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    try {
      const next = await fnRef.current(signal);
      if (signal.aborted) return;
      setData(next);
      setError(null);
      return next;
    } catch (err) {
      if (signal.aborted) return;
      setError(err instanceof Error ? err : new Error("Request failed."));
      return undefined;
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (enabled) return;
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let timeoutId: number | undefined;
    startedAtRef.current = Date.now();
    tickRef.current += 1;

    const schedule = () => {
      if (controller.signal.aborted) return;
      const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
      const delay = elapsed >= backoffAfterMs ? maxInterval : interval;
      timeoutId = window.setTimeout(() => {
        void (async () => {
          const next = await run(controller.signal);
          if (controller.signal.aborted) return;
          if (stopWhenRef.current(next)) return;
          schedule();
        })();
      }, delay);
    };

    void (async () => {
      const next = await run(controller.signal);
      if (controller.signal.aborted) return;
      if (stopWhenRef.current(next)) return;
      schedule();
    })();

    return () => {
      controller.abort();
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [enabled, interval, maxInterval, backoffAfterMs, run]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    return run(controller.signal);
  }, [run]);

  return { data, error, isLoading, refetch };
}
