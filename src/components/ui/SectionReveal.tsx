"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

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
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
