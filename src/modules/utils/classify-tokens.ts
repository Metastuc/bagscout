export function classifyToken(token: MergedBagsTokenWithPool) {
    const h24Tx = token.geckoData?.data?.attributes?.transactions?.h24;
    const total = (h24Tx?.buys ?? 0) + (h24Tx?.sells ?? 0);

    if (total > 100) return "hot";
    if (total > 10) return "warm";
    return "cold";
}
