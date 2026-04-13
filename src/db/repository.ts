import { desc, eq, ilike, or, sql } from "drizzle-orm";

import { tokensTable, type NewTokenRow, type TokenRow } from "./schema";

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
        async getAllTokens(): Promise<Array<MergedBagsTokenWithPool>> {
            const rows = await deps.db.select().from(tokensTable).orderBy(desc(tokensTable.volumeH24));
            return rows.map(toMerged);
        },

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

        async getTokenByPoolAddress(poolAddress: string): Promise<MergedBagsTokenWithPool | null> {
            const rows = await deps.db.select().from(tokensTable).where(eq(tokensTable.poolAddress, poolAddress)).limit(1);
            return rows[0] ? toMerged(rows[0]) : null;
        },

        async getTopTokensByVolume(limit: number): Promise<Array<MergedBagsTokenWithPool>> {
            const rows = await deps.db
                .select()
                .from(tokensTable)
                .where(sql`${tokensTable.volumeH24} > 0`)
                .orderBy(desc(tokensTable.volumeH24))
                .limit(limit);
            return rows.map(toMerged);
        },

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

        async updateGeckoData(poolAddress: string, geckoData: MergedBagsTokenWithPool["geckoData"]): Promise<void> {
            const attributes = geckoData?.data?.attributes;

            await deps.db
                .update(tokensTable)
                .set({
                    geckoIndexed: !!attributes,
                    geckoFetchedAt: geckoData?.fetchedAt,
                    geckoAttributes: attributes ? JSON.stringify(attributes) : null,
                    geckoDexId: geckoData?.data?.relationships?.dex?.data?.id,
                    volumeH24: attributes ? parseFloat(attributes.volume_usd.h24) : undefined,
                    priceChangeH24: attributes ? parseFloat(attributes.price_change_percentage.h24) : undefined,
                    reserveInUsd: attributes ? parseFloat(attributes.reserve_in_usd) : undefined,
                    updatedAt: new Date(),
                })
                .where(eq(tokensTable.poolAddress, poolAddress));
        },
    };
}
