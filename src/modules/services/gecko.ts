export function getGeckoPool(poolId: string, deps: AppDependencies) {
    return fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolId}`)
        .then(async (response) => await response.json())
        .then((responseData: GeckoApiResponse) => {
            deps.logger.info({ msg: "Fetched pool data from Gecko API", data: { poolId } });
            return responseData.data;
        })
        .catch((error) => deps.logger.error(error));
}
