import type { PropsWithChildren } from "react";

interface BaseModalLayoutProps {
    isOpen: boolean;
}

export function BaseModalLayout({ children, isOpen }: PropsWithChildren<BaseModalLayoutProps>) {
    if (!isOpen) return null;
    return <section>{children}</section>;
}
