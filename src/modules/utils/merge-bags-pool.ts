export function mergeBagsTokenWithPool(bagsTokens: Array<BagsTokenInfo>, geckoPools: Array<BagsPoolInfo>): Array<BagsTokenWithPool> {
    const poolMap = new Map(geckoPools.map((pool) => [pool.tokenMint, pool]));

    return bagsTokens.map((token) => {
        const pool = poolMap.get(token.tokenMint);
        return {
            ...token,
            dbcPoolKey: pool?.dbcPoolKey,
            dammV2PoolKey: pool?.dammV2PoolKey ?? null,
            poolAddress: pool?.dammV2PoolKey ?? pool?.dbcPoolKey,
        };
    });
}
