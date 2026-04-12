import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

import { getTokenQueryOptions } from "#/api/get-token.ts";
import { searchTokensQueryOptions } from "#/api/search.ts";
import { SafeImage } from "#/components/safe-image.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Command, CommandDialog, CommandGroup, CommandInput, CommandItem, CommandList } from "#/components/ui/command.tsx";
import { cn } from "#/lib/utils.ts";
import { Route } from "#/routes/__root.tsx";

export function SearchBar() {
    const queryClient = Route.useRouteContext().queryClient;

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");

    const [debouncedQuery] = useDebounceValue(query, 1000);
    const navigate = useNavigate({ from: "/" });

    const { data, isFetching, isError, error } = useQuery(searchTokensQueryOptions(debouncedQuery));
    const tokens = data?.tokens ?? [];

    if (isError) console.error(error);

    return (
        <section className={cn("ml-auto mr-2")}>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="flex size-10! w-fit items-center justify-center">
                <Search size={36} strokeWidth={3} />
            </Button>

            <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
                <Command shouldFilter={false}>
                    <CommandInput placeholder="scouting?..." value={query} onValueChange={setQuery} />
                    <CommandList>
                        {query.length === 0 ? (
                            <CommandGroup heading="Start typing to search">
                                <CommandItem disabled>Search tokens, symbols...</CommandItem>
                            </CommandGroup>
                        ) : null}

                        {query.length > 0 && isFetching ? (
                            <CommandGroup heading="Searching...">
                                <CommandItem disabled>
                                    <span className="mr-2 animate-spin">⏳</span>
                                    Searching...
                                </CommandItem>
                            </CommandGroup>
                        ) : null}

                        {query.length > 0 && !isFetching && tokens.length > 0 ? (
                            <CommandGroup heading="Results">
                                {tokens.map((token) => (
                                    <CommandItem
                                        key={token.tokenMint}
                                        onSelect={() => {
                                            setIsOpen(false);
                                            queryClient.setQueryData(getTokenQueryOptions({ mint: token.tokenMint }).queryKey, { token });
                                            void navigate({ search: (previous) => ({ ...previous, token: token.tokenMint }) });
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {token.image && (
                                                <SafeImage
                                                    src={token.image}
                                                    alt={token.name}
                                                    symbol={token.symbol}
                                                    styles={{
                                                        fallbackImage: "size-5 rounded-full",
                                                        image: "size-5 rounded-full",
                                                    }}
                                                />
                                            )}
                                            <span>{token.name}</span>
                                            <span className="text-muted-foreground text-xs">{token.symbol}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ) : null}

                        {query.length > 0 && !isFetching && tokens.length === 0 ? (
                            <CommandGroup heading="No results">
                                <CommandItem disabled>No tokens found for "{query}"</CommandItem>
                            </CommandGroup>
                        ) : null}
                    </CommandList>
                </Command>
            </CommandDialog>
        </section>
    );
}
