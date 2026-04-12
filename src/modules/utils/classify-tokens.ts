interface ClassifyTokensParams {
    key: string;
    list: Array<MergedBagsTokenWithPool>;
    counter: number;
    deps: CoreDependencies;
}

export async function groupByTier({ counter, deps, key, list }: ClassifyTokensParams) {
    if (list.length === 0) return [];

    let cursor = Number(await deps.redis.get(key)) || 0;
    const selected: Array<MergedBagsTokenWithPool> = [];

    for (let i = 0; i < counter; i++) {
        const index = (cursor + i) % list.length;
        selected.push(list[index]);
    }

    const newCursor = (cursor + counter) % list.length;
    await deps.redis.set(key, newCursor);

    console.log("DB TOKENS REFRESH JOB SCHEDULER", {
        cursorStart: cursor,
        cursorEnd: newCursor,
        total: list.length,
        selected: selected.length,
    });

    return selected;
}

export function classifyToken(token: MergedBagsTokenWithPool) {
    const h24Tx = token.geckoData?.data?.attributes?.transactions?.h24;
    const total = (h24Tx?.buys ?? 0) + (h24Tx?.sells ?? 0);

    if (total > 100) return "hot";
    if (total > 10) return "warm";
    return "cold";
}
