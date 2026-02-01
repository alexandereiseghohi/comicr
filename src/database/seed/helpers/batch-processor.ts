/**
 * @file batch-processor.ts
 * @description Batch processing utility for seeding
 * @author ComicWise Team
 * @date 2026-01-30
 */

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

export async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const chunks = chunkArray(items, batchSize);
  let results: R[] = [];
  for (const chunk of chunks) {
    results = results.concat(await fn(chunk));
  }
  return results;
}
