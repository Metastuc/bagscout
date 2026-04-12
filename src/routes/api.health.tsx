import { createFileRoute } from "@tanstack/react-router";

import { withDependencies } from "../modules";

export const Route = createFileRoute("/api/health")({
    server: {
        handlers: {
            GET: async () => {
                try {
                    return await withDependencies(async (deps) => {
                        let redisHealthy = false,
                            redisStatus = deps.redis.status;

                        try {
                            await deps.redis.ping();
                            redisHealthy = true;
                            redisStatus = "ready";
                        } catch (error) {
                            deps.logger.error({
                                msg: "Redis ping failed",
                                data: { status: deps.redis.status, error: (error as Error).message, stack: (error as Error).stack },
                            });
                        }

                        return new Response(JSON.stringify({ status: redisHealthy ? "ok" : "degraded", redis: redisStatus, timestamp: Date.now() }), {
                            status: redisHealthy ? 200 : 503,
                        });
                    });
                } catch (error) {
                    void withDependencies(async (deps) =>
                        deps.logger.error({
                            msg: "Health check failed",
                            data: { error: (error as Error).message, stack: (error as Error).stack },
                        }),
                    );

                    return new Response(
                        JSON.stringify({
                            status: "error",
                            redis: "down",
                            timestamp: Date.now(),
                            error: (error as Error).message,
                        }),
                        { status: 500 },
                    );
                }
            },
        },
    },
});
