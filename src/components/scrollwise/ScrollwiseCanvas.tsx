"use client";

import { useEffect, useRef } from "react";

import type { ScrollwiseChapter, ScrollwiseMotionPreset } from "@/lib/public-content";

type ScrollProgress = {
    get: () => number;
    on: (event: "change", listener: (value: number) => void) => () => void;
};

function clamp(value: number, minimum = 0, maximum = 1) {
    return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(value: number) {
    const clamped = clamp(value);
    return clamped * clamped * (3 - (2 * clamped));
}

function drawCover(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    width: number,
    height: number,
    zoom: number,
    focusX: number,
    focusY: number,
    opacity: number,
) {
    const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const scale = baseScale * zoom;
    const renderedWidth = image.naturalWidth * scale;
    const renderedHeight = image.naturalHeight * scale;
    const overflowX = Math.max(0, renderedWidth - width);
    const overflowY = Math.max(0, renderedHeight - height);
    const x = -overflowX * clamp(focusX);
    const y = -overflowY * clamp(focusY);

    context.save();
    context.globalAlpha = opacity;
    context.drawImage(image, x, y, renderedWidth, renderedHeight);
    context.restore();
}

export function ScrollwiseCanvas({
    chapters,
    progress,
    staticMotion,
    motionPreset,
}: {
    chapters: ScrollwiseChapter[];
    progress: ScrollProgress;
    staticMotion: boolean;
    motionPreset: ScrollwiseMotionPreset;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || chapters.length === 0) return;
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        // The canvas is a panoramic camera track on every viewport. The portrait
        // assets remain the first-paint fallback, but cannot provide a meaningful
        // horizontal camera journey once they fill a narrow, tall mobile viewport.
        const sources = chapters.map((chapter) => chapter.desktopImage);
        const images = chapters.map((_, index) => {
            const image = new window.Image();
            image.decoding = "async";
            if (index === 0) image.fetchPriority = "high";
            image.dataset.scrollwiseState = "idle";
            return image;
        });
        const ensureImage = (index: number) => {
            const image = images[index];
            const source = sources[index];
            if (!image || !source || image.dataset.scrollwiseState !== "idle") return;
            image.dataset.scrollwiseState = "loading";
            image.src = source;
        };
        let animationFrame = 0;
        let currentProgress = progress.get();

        const render = () => {
            animationFrame = 0;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            if (width === 0 || height === 0) return;
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
            const targetWidth = Math.round(width * pixelRatio);
            const targetHeight = Math.round(height * pixelRatio);
            if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
                canvas.width = targetWidth;
                canvas.height = targetHeight;
            }
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            context.fillStyle = "#fbfcfd";
            context.fillRect(0, 0, width, height);

            const storyAnchor = height * 0.5;
            const chapterElements = chapters.map((chapter) => document.querySelector<HTMLElement>(`[data-scrollwise-chapter="${chapter.key}"]`));
            let sceneIndex = 0;
            for (let index = 0; index < chapterElements.length; index += 1) {
                const rect = chapterElements[index]?.getBoundingClientRect();
                if (rect && rect.top <= storyAnchor) sceneIndex = index;
            }
            const sceneRect = chapterElements[sceneIndex]?.getBoundingClientRect();
            const measuredLocalProgress = sceneRect ? clamp((storyAnchor - sceneRect.top) / Math.max(1, sceneRect.height)) : clamp(currentProgress);
            const localProgress = staticMotion ? 0.38 : measuredLocalProgress;
            const nextIndex = Math.min(chapters.length - 1, sceneIndex + 1);
            const travel = staticMotion ? 0.5 : smoothstep(localProgress / 0.66);
            const shortEpisodeHandoff = chapters[nextIndex]?.role === "episode";
            const transitionStart = shortEpisodeHandoff ? 0.93 : 0.86;
            const transition = staticMotion ? 0 : smoothstep((localProgress - transitionStart) / (1 - transitionStart));
            const directionByScene: Partial<Record<ScrollwiseChapter["key"], 1 | -1>> = {
                gateway: 1, discover: -1, design: 1, buildSecure: -1, oilGas: 1,
                petrochemical: 1, connectedOperations: -1, intelligence: 1, outcomes: -1, finale: 1,
            };
            const direction = directionByScene[chapters[sceneIndex]?.key] ?? (sceneIndex % 2 === 0 ? 1 : -1);
            const activeImage = images[sceneIndex];
            const nextImage = images[nextIndex];
            const camera = motionPreset === "subtle"
                ? { desktopZoom: 0.035, focusStart: 0.24, focusTravel: 0.52 }
                : motionPreset === "balanced"
                    ? { desktopZoom: 0.055, focusStart: 0.14, focusTravel: 0.72 }
                    : { desktopZoom: 0.075, focusStart: 0.08, focusTravel: 0.84 };
            const activeZoom = 1.015 + (travel * camera.desktopZoom);
            const activeFocusX = direction > 0 ? camera.focusStart + (travel * camera.focusTravel) : (1 - camera.focusStart) - (travel * camera.focusTravel);
            const activeFocusY = 0.48 - (Math.sin(travel * Math.PI) * 0.045);

            if (activeImage?.complete && activeImage.naturalWidth > 0) {
                drawCover(context, activeImage, width, height, activeZoom, activeFocusX, activeFocusY, 1);
            }
            if (transition > 0 && nextImage?.complete && nextImage.naturalWidth > 0) {
                const nextDirection = directionByScene[chapters[nextIndex]?.key] ?? (nextIndex % 2 === 0 ? 1 : -1);
                const incomingFocusX = nextDirection > 0 ? camera.focusStart : 1 - camera.focusStart;
                drawCover(context, nextImage, width, height, 1.02, incomingFocusX, 0.48, transition);
            }

            canvas.dataset.scene = chapters[transition > 0.5 ? nextIndex : sceneIndex]?.key;
            canvas.dataset.imageState = activeImage?.dataset.scrollwiseState ?? "missing";
            canvas.dataset.phase = localProgress < 0.66 ? "story" : localProgress < transitionStart ? "interlude" : "handoff";
            canvas.dataset.cameraX = activeFocusX.toFixed(4);
            canvas.dataset.cameraY = activeFocusY.toFixed(4);
            canvas.dataset.cameraZoom = activeZoom.toFixed(4);
        };

        const scheduleRender = () => {
            if (animationFrame === 0) animationFrame = window.requestAnimationFrame(render);
        };
        const onProgress = (value: number) => {
            currentProgress = value;
            const sceneIndex = Math.min(chapters.length - 1, Math.floor(clamp(value) * chapters.length));
            ensureImage(sceneIndex);
            ensureImage(sceneIndex + 1);
            ensureImage(sceneIndex + 2);
            scheduleRender();
        };
        const resizeObserver = new ResizeObserver(scheduleRender);
        resizeObserver.observe(canvas);
        const unsubscribe = progress.on("change", onProgress);
        const handleLoad = (event: Event) => {
            (event.currentTarget as HTMLImageElement).dataset.scrollwiseState = "loaded";
            scheduleRender();
        };
        const handleError = (event: Event) => {
            (event.currentTarget as HTMLImageElement).dataset.scrollwiseState = "error";
            scheduleRender();
        };
        for (const image of images) {
            image.addEventListener("load", handleLoad);
            image.addEventListener("error", handleError);
        }
        onProgress(currentProgress);

        return () => {
            unsubscribe();
            resizeObserver.disconnect();
            if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
            for (const image of images) {
                image.removeEventListener("load", handleLoad);
                image.removeEventListener("error", handleError);
                image.src = "";
            }
        };
    }, [chapters, motionPreset, progress, staticMotion]);

    return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" data-scrollwise-canvas />;
}
