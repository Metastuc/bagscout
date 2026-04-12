import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { toTime } from "#/utils/time.ts";

import { withDependencies } from "../modules";

const getTokenServerFn = createServerFn({ method: "GET" })
    .inputValidator(
        z.object({
            mint: z.string().optional(),
            pool: z.string().optional(),
        }),
    )
    .handler(async function ({ data: { mint, pool } }) {
        return await withDependencies(async (deps) => {
            try {
                return { token: await deps.tokensRepository.getToken({ tokenMint: mint, poolAddress: pool }) };
            } catch (error) {
                deps.logger.error({ msg: (error as Error).message, data: { stack: (error as Error).stack } });
                return { token: null };
            }
        });
    });

export const getTokenQueryOptions = (input: { mint?: string; pool?: string }) =>
    queryOptions({
        enabled: !!input.mint || !!input.pool,
        placeholderData: (previous) => previous,
        queryFn: () => getTokenServerFn({ data: { mint: input.mint, pool: input.pool } }),
        queryKey: ["get_token", input.mint, input.pool],
        staleTime: toTime({ unit: "minutes", value: 5, output: "milliseconds" }) as number,
        gcTime: toTime({ unit: "minutes", value: 10, output: "milliseconds" }) as number,
    });
