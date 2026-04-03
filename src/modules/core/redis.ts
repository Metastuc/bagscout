import Redis from "ioredis";

import { SERVER_ENV } from "../../../env";

export const redis = new Redis(SERVER_ENV.REDIS_URL, {
    maxRetriesPerRequest: null,
});

redis.on("error", (error) => console.error(error));
redis.on("connect", () => console.log("Connected to Redis"));
