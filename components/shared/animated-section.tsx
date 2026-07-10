"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Single scroll-reveal wrapper used across all sections so the animation
 * language stays consistent: fade in + 12px rise, 450ms ease-out, runs once.
 * Respects prefers-reduced-motion (renders static).
 *
 * Uses LazyMotion + `m` (domAnimation subset) to keep the client bundle small.
 *
 * Use `delay` (seconds) for simple stagger in grids, e.g. `index * 0.06`.
 */
type AnimatedSectionProps = ComponentProps<typeof m.div> & {
  delay?: number;
};

export function AnimatedSection({ className, delay = 0, ...props }: AnimatedSectionProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={cn(className)} {...(props as ComponentProps<"div">)} />;
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={cn(className)}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -80px 0px" }}
        transition={{ duration: 0.45, ease: "easeOut", delay }}
        {...props}
      />
    </LazyMotion>
  );
}
