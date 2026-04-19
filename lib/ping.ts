const TIMEOUT_MS = 4000;

/**
 * Measure round-trip latency to a host by firing `samples` HTTPS requests
 * and returning the minimum. Uses `mode: 'no-cors'` so the request succeeds
 * regardless of CORS headers on the remote — we can't read the response,
 * but timing the opaque completion is enough for ordering worlds by ping.
 *
 * Returns `null` if every sample errored or timed out.
 */
export async function pingHost(host: string, samples: number): Promise<number | null> {
  const url = `https://${host}/jav_config.ws`;
  const timings: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      await fetch(`${url}?cb=${Date.now()}-${i}`, {
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);
      timings.push(performance.now() - start);
    } catch {
      // timeout or network failure — skip this sample
    }
  }

  return timings.length === 0 ? null : Math.min(...timings);
}

/**
 * Run `worker` over every item with at most `concurrency` tasks in flight.
 * Preserves input order in the returned array and reports progress as each
 * task completes. Similar to `Promise.all` but bounded.
 */
export async function runPool<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  let done = 0;

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i], i);
      done++;
      onProgress?.(done, items.length);
    }
  });

  await Promise.all(runners);
  return results;
}
