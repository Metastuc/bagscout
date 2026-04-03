import { useState } from "react";

export function SafeImage({ alt, src, symbol }: { alt: string; src: string; symbol: string }) {
    const [hasError, setHasError] = useState<boolean>(false);

    if (hasError || !src) {
        return (
            <div className="bg-muted flex size-10 items-center justify-center rounded-xs text-xl font-medium uppercase">
                <span>{symbol.slice(0, 1).toUpperCase()}</span>
            </div>
        );
    }

    return <img src={src} alt={alt} className="size-10 rounded-xs" onError={() => setHasError(true)} />;
}
