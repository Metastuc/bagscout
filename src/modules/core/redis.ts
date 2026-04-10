import Redis from "ioredis";

import { SERVER_ENV } from "#/env/server-env.ts";

export const redis = new Redis(SERVER_ENV.REDIS_URL, {
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: null,
});

redis.on("error", (error) => console.error("Redis error:", error));
redis.on("connect", () => console.log("Connected to Redis"));
