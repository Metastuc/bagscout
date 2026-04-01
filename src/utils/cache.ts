import fs from "fs";
import path from "path";

import { toTime } from "./time";

const CACHE_FILE = path.resolve("./.cache/tokens.json");
const CACHE_TTL = toTime({
  unit: "days",
  value: 7,
  output: "milliseconds",
}) as number; // 7 days in milliseconds

let queue = Promise.resolve(); // Initialize an empty promise to create a queue

interface CacheData {
  lastFetched: number;
  tokens: Array<MergedBagsTokenWithPool>;
}

// Read cache from disk
function readCache(): CacheData | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Write cache to disk
function writeCache(tokens: Array<MergedBagsTokenWithPool>) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify({ lastFetched: Date.now(), tokens }, null, 2),
  );
}

export function updateTokenCache(
  poolAddress: string,
  geckoData: MergedBagsTokenWithPool["geckoData"],
) {
  queue = queue.then(() => {
    const cache = readCache();
    if (!cache) return; // No cache to update

    writeCache(
      cache.tokens.map((token) =>
        token.poolAddress === poolAddress ? { ...token, geckoData } : token,
      ),
    );
  });

  return queue; // Return the promise to allow callers to wait for the update to complete
}

// Check if cache is still valid
function isCacheValid(cache: CacheData | null) {
  if (!cache) return false;
  return Date.now() - cache.lastFetched < CACHE_TTL;
}

export const cacheUtils = {
  isCacheValid,
  readCache,
  updateTokenCache,
  writeCache,
};
