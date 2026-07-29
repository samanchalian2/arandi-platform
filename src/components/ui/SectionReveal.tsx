"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import { revealTransition, revealVariants } from "./motion";

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
};

export function SectionReveal({ children, className }: SectionRevealProps) {
  const [isMounted, setIsMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!isMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : "hidden"}
      whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : "visible"}
      variants={revealVariants}
      viewport={{ once: true, amount: 0.2 }}
      transition={revealTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
