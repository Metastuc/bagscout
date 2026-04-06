import { Fragment, type ReactNode } from "react";

import { PrivyContext } from "./privy";

export function ApplicationContextProvider({ children }: { children: ReactNode }) {
    return (
        <Fragment>
            <PrivyContext>{children}</PrivyContext>
        </Fragment>
    );
}
