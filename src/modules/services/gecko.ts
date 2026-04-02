export function getGeckoPool(poolId: string, deps: AppDependencies) {
  return fetch(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolId}`,
  )
    .then(async (response) => await response.json())
    .then((responseData: GeckoApiResponse) => {
      if (!responseData.data) return null;
      deps.logger.info({
        msg: "Fetched pool data from Gecko API",
        data: { poolId },
      });
      return responseData.data;
    })
    .catch((error) =>
      deps.logger.error({
        msg: "Error fetching pool data from Gecko API",
        data: {
          poolId,
          stack: (error as Error).stack,
          message: (error as Error).message,
        },
      }),
    );
}

export function getGeckoPools(
  poolIds: string[],
  deps: AppDependencies,
): Promise<Array<GeckoPoolData>> {
  const idsParam = poolIds.join(",");

  return fetch(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/multi/${idsParam}`,
  )
    .then(async (response) => await response.json())
    .then((responseData: { data: GeckoPoolData[] }) => {
      deps.logger.info({
        msg: "Fetched multiple pools data from Gecko API",
        data: {
          poolIds: responseData.data.map((d) => d.id),
          count: responseData.data.length,
        },
      });
      return responseData.data;
    })
    .catch((error) => {
      deps.logger.error({
        msg: "Error fetching multiple pools data from Gecko API",
        data: {
          poolIds,
          stack: (error as Error).stack,
          message: (error as Error).message,
        },
      });
      return [];
    });
}
