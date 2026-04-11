import type { PropsWithChildren } from "react";

interface BaseModalLayoutProps {}

export function BaseModalLayout({ children }: PropsWithChildren<BaseModalLayoutProps>) {
    return <section>{children}</section>;
}
