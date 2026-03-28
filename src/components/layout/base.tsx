export function BaseLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="border border-green-500 h-[calc(100vh-3.75rem)] w-full md:w-[calc(100vw-12rem)] ml-auto">
            <div>{children}</div>
        </section>
    );
}
