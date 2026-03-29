import fs from "fs";
import path from "path";

const CACHE_FILE = path.resolve("./.cache/tokens.json");
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CacheData {
    lastFetched: number;
    tokens: any[];
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
function writeCache(tokens: any[]) {
    const data: CacheData = { lastFetched: Date.now(), tokens };
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

// Check if cache is still valid
function isCacheValid(cache: CacheData | null) {
    if (!cache) return false;
    return Date.now() - cache.lastFetched < CACHE_TTL;
}

export const cacheUtils = {
    readCache,
    writeCache,
    isCacheValid,
};
