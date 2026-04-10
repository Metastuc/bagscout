CREATE TABLE "tokens" (
	"token_mint" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"symbol" varchar NOT NULL,
	"description" text,
	"image" text,
	"status" varchar NOT NULL,
	"twitter" varchar,
	"website" varchar,
	"uri" text,
	"launch_signature" varchar,
	"account_keys" text,
	"dbc_pool_key" varchar,
	"dbc_config_key" varchar,
	"damm_v2_pool_key" varchar,
	"pool_address" varchar,
	"volume_h24" double precision,
	"price_change_h24" double precision,
	"reserve_in_usd" double precision,
	"gecko_indexed" boolean DEFAULT false,
	"gecko_fetched_at" bigint,
	"gecko_attributes" text,
	"gecko_dex_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_pool_address" ON "tokens" USING btree ("pool_address");--> statement-breakpoint
CREATE INDEX "idx_volume_h24" ON "tokens" USING btree ("volume_h24");--> statement-breakpoint
CREATE INDEX "idx_status" ON "tokens" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_symbol" ON "tokens" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "idx_name" ON "tokens" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_price_change_h24" ON "tokens" USING btree ("price_change_h24");--> statement-breakpoint
CREATE INDEX "idx_reserve_in_usd" ON "tokens" USING btree ("reserve_in_usd");--> statement-breakpoint
CREATE INDEX "idx_created_at" ON "tokens" USING btree ("created_at");