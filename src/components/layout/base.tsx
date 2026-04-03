import { cn } from "#/lib/utils.ts";

export function BaseLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className={cn("ml-auto h-[calc(100dvh-6.75rem)] w-full pb-20", "lg:h-[calc(100vh-6rem)] lg:w-[calc(100vw-12rem)] lg:pb-0")}>
            {children}
        </section>
    );
}
