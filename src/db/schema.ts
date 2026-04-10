import * as t from "drizzle-orm/pg-core";

export const tokensTable = t.pgTable(
    "tokens",
    {
        tokenMint: t.varchar("token_mint").primaryKey(),
        name: t.varchar("name").notNull(),
        symbol: t.varchar("symbol").notNull(),
        description: t.text("description"),
        image: t.text("image"),
        status: t
            .varchar("status", {
                enum: ["PRE_LAUNCH", "PRE_GRAD", "MIGRATING", "MIGRATED"],
            })
            .notNull(),
        twitter: t.varchar("twitter"),
        website: t.varchar("website"),
        uri: t.text("uri"),
        launchSignature: t.varchar("launch_signature"),
        accountKeys: t.text("account_keys"),
        dbcPoolKey: t.varchar("dbc_pool_key"),
        dbcConfigKey: t.varchar("dbc_config_key"),
        dammV2PoolKey: t.varchar("damm_v2_pool_key"),
        poolAddress: t.varchar("pool_address"),
        volumeH24: t.doublePrecision("volume_h24"),
        priceChangeH24: t.doublePrecision("price_change_h24"),
        reserveInUsd: t.doublePrecision("reserve_in_usd"),
        geckoIndexed: t.boolean("gecko_indexed").default(false),
        geckoFetchedAt: t.bigint("gecko_fetched_at", { mode: "number" }),
        geckoAttributes: t.text("gecko_attributes"),
        geckoDexId: t.varchar("gecko_dex_id"),
        createdAt: t.timestamp("created_at").defaultNow(),
        updatedAt: t.timestamp("updated_at").defaultNow(),
    },
    (table) => [
        t.uniqueIndex("idx_pool_address").on(table.poolAddress),
        t.index("idx_volume_h24").on(table.volumeH24),
        t.index("idx_status").on(table.status),
        t.index("idx_symbol").on(table.symbol),
        t.index("idx_name").on(table.name),
        t.index("idx_price_change_h24").on(table.priceChangeH24),
        t.index("idx_reserve_in_usd").on(table.reserveInUsd),
        t.index("idx_created_at").on(table.createdAt),
    ],
);

export type TokenRow = typeof tokensTable.$inferSelect;
export type NewTokenRow = typeof tokensTable.$inferInsert;
