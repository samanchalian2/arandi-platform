import type { Transition, Variants } from "framer-motion";

export const motionTokens = {
    revealDistance: 18,
    blurStart: 2,
    durationReveal: 0.56,
    durationHover: 0.2,
    durationFocus: 0.18,
    staggerStep: 0.09,
    easeStandard: [0.2, 0, 0, 1] as const,
    easeEmphasized: [0.16, 1, 0.3, 1] as const,
};

export const revealTransition: Transition = {
    duration: motionTokens.durationReveal,
    ease: motionTokens.easeEmphasized,
};

export const revealVariants: Variants = {
    hidden: {
        opacity: 0,
        y: motionTokens.revealDistance,
        filter: `blur(${motionTokens.blurStart}px)`,
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
    },
};

export const staggerContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: motionTokens.staggerStep,
            delayChildren: 0,
        },
    },
};

export const hoverLiftTransition: Transition = {
    duration: motionTokens.durationHover,
    ease: motionTokens.easeStandard,
};
