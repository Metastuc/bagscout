type GeckoDataMode = "NONE" | "PARTIAL" | "FULL" | "VOLUME_ONLY";

type TokensPage = {
    tokens: MergedBagsTokenWithPool[];
    nextCursor?: string;
};
