import { useEffect, useRef, useState, Fragment } from "react";

import { cn } from "#/lib/utils.ts";

export function SafeImage({ alt, src, symbol, styles }: { alt: string; src: string; symbol: string; styles?: Record<string, string> }) {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!imgRef.current) return;
        if (imgRef.current.complete) {
            setStatus(imgRef.current.naturalWidth === 0 ? "error" : "loaded");
        }
    }, [src]);

    const fallback = (
        <div className={cn("bg-muted flex size-10 items-center justify-center rounded-xs text-xl font-medium uppercase", styles?.fallbackImage)}>
            <span>{symbol.slice(0, 1).toUpperCase()}</span>
        </div>
    );

    if (!src || status === "error") return fallback;

    return (
        <Fragment>
            {status === "loading" && fallback}
            <img
                ref={imgRef}
                key={src}
                src={src}
                alt={alt}
                loading="eager"
                className={cn("size-10 rounded-xs", status !== "loaded" && "hidden", styles?.image)}
                onLoad={() => setStatus("loaded")}
                onError={() => setStatus("error")}
            />
        </Fragment>
    );
}
