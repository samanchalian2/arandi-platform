import type { Transition, Variants } from "motion/react";

export const motionTokens = {
    revealDistance: 10,
    durationReveal: 0.34,
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
    },
    visible: {
        opacity: 1,
        y: 0,
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
