import { SERVER_ENV } from "../../../env";

const options = { method: "GET", headers: { "x-api-key": SERVER_ENV.BAGS_API_KEY } };

export async function getTokensFromBags(deps: AppDependencies) {
    return await fetch("https://public-api-v2.bags.fm/api/v1/token-launch/feed", options)
        .then(async (response) => await response.json())
        .then((responseData: BagsApiResponse<BagsTokenInfo>) => {
            deps.logger.info({ msg: "Fetched tokens from Bags API", data: { count: responseData.response.length } });
            return responseData.response;
        })
        .catch((error) => deps.logger.error(error));
}

export async function getPoolsFromBags(deps: AppDependencies) {
    return await fetch("https://public-api-v2.bags.fm/api/v1/solana/bags/pools", options)
        .then(async (response) => await response.json())
        .then((responseData: BagsApiResponse<BagsPoolInfo>) => {
            deps.logger.info({ msg: "Fetched pools from Bags API", data: { count: responseData.response.length } });
            return responseData.response;
        })
        .catch((error) => deps.logger.error(error));
}
