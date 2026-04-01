export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="ml-auto h-[calc(100vh-6rem)] w-full md:w-[calc(100vw-12rem)]">
      {children}
    </section>
  );
}
