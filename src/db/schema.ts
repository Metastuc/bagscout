import * as t from "drizzle-orm/sqlite-core";

export const usersTable = t.sqliteTable("sample_table", {
    id: t.int().primaryKey({ autoIncrement: true }),
});
