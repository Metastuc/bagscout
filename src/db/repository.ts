import { desc, eq, ilike, or, sql } from "drizzle-orm";

import { tokensTable, type NewTokenRow, type TokenRow } from "./schema";

/**
 * Converts a TokenRow into a MergedBagsTokenWithPool.
 *
 * @param row - The TokenRow to convert.
 * @returns The converted MergedBagsTokenWithPool.
 */
function toMerged(row: TokenRow): MergedBagsTokenWithPool {
    const attributes = row.geckoAttributes ? (JSON.parse(row.geckoAttributes) as GeckoPoolAttributes) : null;

    return {
        tokenMint: row.tokenMint,
        name: row.name,
        symbol: row.symbol,
        description: row.description ?? "",
        image: row.image ?? "",
        status: row.status,
        twitter: row.twitter ?? "",
        website: row.website ?? "",
        uri: row.uri ?? "",
        launchSignature: row.launchSignature ?? "",
        accountKeys: row.accountKeys ? JSON.parse(row.accountKeys) : [],
        dbcPoolKey: row.dbcPoolKey ?? "",
        dbcConfigKey: row.dbcConfigKey ?? "",
        dammV2PoolKey: row.dammV2PoolKey,
        poolAddress: row.poolAddress,
        numRequiredSigners: 0,

        geckoData: row.geckoFetchedAt
            ? {
                  fetchedAt: row.geckoFetchedAt,
                  data: attributes
                      ? {
                            id: `solana_${row.poolAddress}`,
                            type: "pool",
                            attributes,
                            relationships: {
                                base_token: { data: { id: `solana_${row.tokenMint}`, type: "token" } },
                                quote_token: { data: { id: "solana_So11111111111111111111111111111111111111112", type: "token" } },
                                dex: { data: { id: row.geckoDexId ?? "", type: "dex" } },
                            },
                        }
                      : null,
              }
            : undefined,

        lastFetched: row.updatedAt?.getTime() ?? Date.now(),
    };
}

/**
 * Returns a NewTokenRow object with the given MergedBagsTokenWithPool.
 *
 * @param {MergedBagsTokenWithPool} token - The MergedBagsTokenWithPool to use.
 * @returns {NewTokenRow} - The NewTokenRow object containing the token's data.
 */
function fromMerged(token: MergedBagsTokenWithPool): NewTokenRow {
    const attributes = token.geckoData?.data?.attributes;

    return {
        tokenMint: token.tokenMint,
        name: token.name,
        symbol: token.symbol,
        description: token.description,
        image: token.image,
        status: token.status,
        twitter: token.twitter,
        website: token.website,
        uri: token.uri,
        launchSignature: token.launchSignature,
        accountKeys: JSON.stringify(token.accountKeys),
        dbcPoolKey: token.dbcPoolKey,
        dbcConfigKey: token.dbcConfigKey,
        dammV2PoolKey: token.dammV2PoolKey,
        poolAddress: token.poolAddress,

        volumeH24: attributes ? parseFloat(attributes.volume_usd.h24) : undefined,
        priceChangeH24: attributes ? parseFloat(attributes.price_change_percentage.h24) : undefined,
        reserveInUsd: attributes ? parseFloat(attributes.reserve_in_usd) : undefined,
        geckoIndexed: !!attributes,
        geckoFetchedAt: token.geckoData?.fetchedAt,
        geckoAttributes: attributes ? JSON.stringify(attributes) : undefined,
        geckoDexId: token.geckoData?.data?.relationships?.dex?.data?.id,

        updatedAt: new Date(),
    };
}

export function createTokensRepository(deps: CoreDependencies) {
    return {
        /**
         * Retrieves all tokens from the database, sorted by volume in descending order.
         * @returns {Promise<Array<MergedBagsTokenWithPool>>} A promise that resolves
         * with an array of MergedBagsTokenWithPool objects.
         */
        async getAllTokens(): Promise<Array<MergedBagsTokenWithPool>> {
            const rows = await deps.db.select().from(tokensTable).orderBy(desc(tokensTable.volumeH24));
            return rows.map(toMerged);
        },

        /**
         * Retrieves a single token from the database.
         * If the tokenMint is provided, it will be used to search for the token.
         * If the poolAddress is provided, it will be used to search for the token.
         * If neither tokenMint nor poolAddress is provided, it will return null.
         * @param {{ tokenMint?: string; poolAddress?: string }}
         * @returns {Promise<MergedBagsTokenWithPool | null>} A promise that resolves
         * with the retrieved token or null if it does not exist.
         */
        async getToken(input: { tokenMint?: string; poolAddress?: string }) {
            if (input.tokenMint) {
                const rows = await deps.db.select().from(tokensTable).where(eq(tokensTable.tokenMint, input.tokenMint)).limit(1);
                return rows[0] ? toMerged(rows[0]) : null;
            }

            if (input.poolAddress) {
                const rows = await deps.db.select().from(tokensTable).where(eq(tokensTable.poolAddress, input.poolAddress)).limit(1);
                return rows[0] ? toMerged(rows[0]) : null;
            }

            return null;
        },

        /**
         * Retrieves the top tokens by volume from the database.
         * @param {number} limit The number of tokens to retrieve.
         * @returns {Promise<Array<MergedBagsTokenWithPool>>} A promise that resolves
         * with an array of MergedBagsTokenWithPool objects, sorted by volume in descending order.
         */
        async getTopTokensByVolume(limit: number): Promise<Array<MergedBagsTokenWithPool>> {
            const rows = await deps.db
                .select()
                .from(tokensTable)
                .where(sql`${tokensTable.volumeH24} > 0`)
                .orderBy(desc(tokensTable.volumeH24))
                .limit(limit);
            return rows.map(toMerged);
        },

        /**
         * Upserts tokens into the database.
         * It maps each token to its corresponding NewTokenRow, then chunks the array into smaller arrays
         * and inserts them into the database. If a token already exists in the database, it updates the existing
         * token with the new values.
         * @param {Array<MergedBagsTokenWithPool>} tokens The array of tokens to upsert.
         * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
         */
        async upsertTokens(tokens: Array<MergedBagsTokenWithPool>): Promise<void> {
            const newRows = tokens.map(fromMerged);
            const chunkSize = 50;

            for (let index = 0; index < newRows.length; index += chunkSize) {
                await deps.db
                    .insert(tokensTable)
                    .values(newRows.slice(index, index + chunkSize))
                    .onConflictDoUpdate({
                        target: tokensTable.tokenMint,
                        set: {
                            accountKeys: sql`excluded.account_keys`,
                            dammV2PoolKey: sql`excluded.damm_v2_pool_key`,
                            dbcConfigKey: sql`excluded.dbc_config_key`,
                            dbcPoolKey: sql`excluded.dbc_pool_key`,
                            description: sql`excluded.description`,
                            image: sql`excluded.image`,
                            launchSignature: sql`excluded.launch_signature`,
                            name: sql`excluded.name`,
                            poolAddress: sql`excluded.pool_address`,
                            status: sql`excluded.status`,
                            symbol: sql`excluded.symbol`,
                            twitter: sql`excluded.twitter`,
                            updatedAt: sql`excluded.updated_at`,
                            uri: sql`excluded.uri`,
                            website: sql`excluded.website`,
                        },
                    });
            }
        },

        /**
         * Searches for tokens by name or symbol, and returns the results sorted by volume in descending order.
         * If the query length is less than 2, it will return an empty array.
         * @param {string} query The search query.
         * @param {number} [limit=10] The number of tokens to retrieve.
         * @returns {Promise<Array<MergedBagsTokenWithPool>>} A promise that resolves
         * with an array of MergedBagsTokenWithPool objects.
         */
        async searchTokens(query: string, limit = 10) {
            if (query.length < 2) return [];

            const search = `%${query}%`;
            const rows = await deps.db
                .select()
                .from(tokensTable)
                .where(or(ilike(tokensTable.name, search), ilike(tokensTable.symbol, search)))
                .orderBy(desc(tokensTable.volumeH24))
                .limit(limit);

            return rows.map(toMerged);
        },

        /**
         * Updates a single token in the database with its Gecko data.
         * If the token does not exist in the database, it is added with the current timestamp
         * If the token does exist, its last fetched timestamp is updated
         * @param {string} poolAddress The pool address of the token to update
         * @param {MergedBagsTokenWithPool["geckoData"]} geckoData The Gecko data of the token to update
         * @returns {Promise<void>} A promise that resolves when the token has been updated in the database
         */
        async updateGeckoData(poolAddress: string, geckoData: MergedBagsTokenWithPool["geckoData"]): Promise<void> {
            const attributes = geckoData?.data?.attributes;

            await deps.db
                .update(tokensTable)
                .set({
                    geckoAttributes: attributes ? JSON.stringify(attributes) : null,
                    geckoDexId: geckoData?.data?.relationships?.dex?.data?.id,
                    geckoFetchedAt: geckoData?.fetchedAt,
                    geckoIndexed: !!attributes,
                    priceChangeH24: attributes ? parseFloat(attributes.price_change_percentage.h24) : undefined,
                    reserveInUsd: attributes ? parseFloat(attributes.reserve_in_usd) : undefined,
                    updatedAt: new Date(),
                    volumeH24: attributes ? parseFloat(attributes.volume_usd.h24) : undefined,
                })
                .where(eq(tokensTable.poolAddress, poolAddress));
        },
    };
}
