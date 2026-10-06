import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type SteelBackdropProps = {
  /** Extra classes for the wrapping layer (e.g. to tune opacity per section). */
  className?: string;
  /** Corner the brand-blue glow sits in. */
  glow?: "top-right" | "top-left" | "bottom-left" | "bottom-right";
  /** Where the blueprint grid fades from - mirrors the section's edge. */
  fadeFrom?: "top" | "bottom";
  /** Show the welding-arc sparks running along the grid lines. */
  sparks?: boolean;
};

const glowPosition: Record<NonNullable<SteelBackdropProps["glow"]>, string> = {
  "top-right": "-top-40 right-[-10%]",
  "top-left": "-top-40 left-[-10%]",
  "bottom-left": "-bottom-40 left-[-10%]",
  "bottom-right": "-bottom-40 right-[-10%]",
};

/*
 * Sparks ride the horizontal grid lines. The grid has a 48px pitch with the
 * line drawn at 47-48px, so a line centre is at 47.5 + n*48; a 2px spark is
 * centred on it at top = 46.5 + n*48.
 *
 * Line choice avoids the section edge: for `top` sections the first lines sit
 * under the sticky 64px navbar, so we start at n=2; for `bottom` sections
 * (footer) we stay close to the bottom edge where the grid is brightest.
 */
const SPARK_LINES: Record<"top" | "bottom", number[]> = {
  top: [2, 5, 8],
  bottom: [1, 3, 5],
};
const SPARK_TIMING = [
  { duration: 8, delay: 0 },
  { duration: 11, delay: 3.5 },
  { duration: 9.5, delay: 6.5 },
];
const gridLineOffset = (n: number) => 46.5 + n * 48;

/*
 * Thematic backdrop for the site's dark sections (hero, footer). Pure CSS -
 * no image request - so it never touches LCP or the Lighthouse budget.
 * Three layers evoke the brand: a technical blueprint grid (a nod to working
 * "podľa výkresovej dokumentácie"), a fine brushed-steel sheen, and a brand
 * glow. Decorative only → aria-hidden + pointer-events-none.
 */
export function SteelBackdrop({
  className,
  glow = "top-right",
  fadeFrom = "top",
  sparks = true,
}: SteelBackdropProps) {
  const fade =
    fadeFrom === "top"
      ? "radial-gradient(ellipse 100% 95% at 50% 0%, #000 60%, transparent 100%)"
      : "radial-gradient(ellipse 100% 95% at 50% 100%, #000 60%, transparent 100%)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Depth: lift the flat black into a subtle steel gradient */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            fadeFrom === "top"
              ? "linear-gradient(180deg, rgba(255,255,255,0.05), transparent 40%)"
              : "linear-gradient(0deg, rgba(255,255,255,0.05), transparent 40%)",
        }}
      />

      {/* Blueprint grid - more present, but in a soft cool-steel tint (not
          stark white) so it stays gentle; faded inward with a radial mask. */}
      <div
        className="absolute inset-0"
        style={{
          // Horizontal lines are anchored to the same edge as the sparks
          // (180deg = from the top, 0deg = from the bottom); otherwise the
          // section height shifts the lines off the spark offsets.
          backgroundImage: `repeating-linear-gradient(${fadeFrom === "top" ? "180deg" : "0deg"}, transparent 0 47px, rgba(198,214,240,0.11) 47px 48px), repeating-linear-gradient(90deg, transparent 0 47px, rgba(198,214,240,0.11) 47px 48px)`,
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />

      {/* Welding arcs running along the grid lines (CSS, reduced-motion aware).
          Masked with the same fade so they live where the grid is brightest. */}
      {sparks ? (
        <div className="absolute inset-0" style={{ maskImage: fade, WebkitMaskImage: fade }}>
          {SPARK_LINES[fadeFrom].map((line, i) => (
            <span
              key={line}
              className="weld-spark"
              style={
                {
                  // Anchor to the edge the grid fades from, so arcs ride a real
                  // grid line and stay where the grid is brightest.
                  [fadeFrom]: gridLineOffset(line),
                  "--weld-duration": `${SPARK_TIMING[i].duration}s`,
                  "--weld-delay": `${SPARK_TIMING[i].delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

      {/* Brushed-steel sheen - fine horizontal lines */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)",
        }}
      />

      {/* Brand glow */}
      <div
        className={cn(
          "absolute size-[480px] rounded-full bg-[oklch(0.4866_0.2203_263.04)] opacity-15 blur-[140px]",
          glowPosition[glow],
        )}
      />
    </div>
  );
}
