import { cn } from "@/lib/utils";

/*
 * Consistent section heading: optional eyebrow, title with brand accent line,
 * optional description. Keeps typography identical across all sections.
 */
type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
      <div
        className={cn("bg-primary mt-4 h-1 w-12 rounded-full", align === "center" && "mx-auto")}
      />
      {description ? <p className="text-muted-foreground mt-4 text-lg">{description}</p> : null}
    </div>
  );
}
