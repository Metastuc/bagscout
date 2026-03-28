import { getTokens } from "#/api/get-tokens.ts";
import { createFileRoute } from "@tanstack/react-router";
import { withDependencies } from "../modules";

export const Route = createFileRoute("/api/tokens")({
    server: {
        handlers: {
            async GET() {
                return Response.json({ tokens: await withDependencies(async (deps) => await getTokens(deps)) });
            }
        }
    }
});

