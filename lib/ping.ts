const TIMEOUT_MS = 4000;

export async function pingHost(host: string, samples = 2): Promise<number | null> {
  const url = `https://${host}/jav_config.ws`;
  const results: number[] = [];
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
      await fetch(`${url}?cb=${Date.now()}-${i}`, {
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(t);
      results.push(performance.now() - start);
    } catch {
      // timeout or network failure — skip this sample
    }
  }
  return results.length ? Math.min(...results) : null;
}

export async function runPool<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (idx < items.length) {
        const i = idx++;
        results[i] = await worker(items[i], i);
        done++;
        onProgress?.(done, items.length);
      }
    }),
  );
  return results;
}
