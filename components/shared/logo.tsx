import { cn } from "@/lib/utils";

/*
 * Temporary text-based logo in the brand color.
 * TODO: replace with the client's SVG/PNG logo file when delivered —
 * keep the component API (className) so call sites don't change.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-heading text-primary-soft text-xl font-bold tracking-tight", className)}
      aria-label="RSweld"
    >
      RS<span className="text-foreground">weld</span>
    </span>
  );
}
