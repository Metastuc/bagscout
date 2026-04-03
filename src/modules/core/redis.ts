import Redis from "ioredis";

import { SERVER_ENV } from "../../../env";

export const redis = new Redis(SERVER_ENV.REDIS_URL, {
    maxRetriesPerRequest: null,
});

export function isRedisAvailable() {
    return redis.status === "ready";
}
