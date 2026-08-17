"use client";

import { useSyncExternalStore } from "react";

const MOTION_KEY = "arandi-scrollwise-motion";
const MOTION_EVENT = "arandi-scrollwise-motion";

function subscribe(onStoreChange: () => void) {
    window.addEventListener(MOTION_EVENT, onStoreChange);
    window.addEventListener("storage", onStoreChange);
    return () => {
        window.removeEventListener(MOTION_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
    };
}

function getSnapshot() {
    return window.localStorage.getItem(MOTION_KEY) === "paused";
}

export function useScrollwiseMotionPreference() {
    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function setScrollwiseMotionPaused(paused: boolean) {
    window.localStorage.setItem(MOTION_KEY, paused ? "paused" : "playing");
    window.dispatchEvent(new Event(MOTION_EVENT));
}
