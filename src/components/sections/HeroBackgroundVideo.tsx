"use client";

import { useEffect, useState } from "react";

type HeroBackgroundVideoProps = {
    src: string;
    poster?: string | null;
};

export function HeroBackgroundVideo({ src, poster }: HeroBackgroundVideoProps) {
    const [canAnimate, setCanAnimate] = useState(false);

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setCanAnimate(!query.matches);
        update();
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
    }, []);

    if (!canAnimate) return null;

    return (
        <video
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster ?? undefined}
            aria-hidden="true"
            tabIndex={-1}
        >
            <source src={src} type={src.toLowerCase().endsWith(".mp4") ? "video/mp4" : "video/webm"} />
        </video>
    );
}
