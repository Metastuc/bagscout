import Redis from "ioredis";

export const redis = new Redis("redis://localhost:6379", { maxRetriesPerRequest: null });

export function isRedisAvailable() {
    return redis.status === "ready";
}
