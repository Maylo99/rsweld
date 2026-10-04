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
  /** Heading level — `h1` for the page title of a subpage, `h2` otherwise. */
  as?: "h1" | "h2";
  /** Id of the heading, for `aria-labelledby` on the parent section. */
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">{eyebrow}</p>
      ) : null}
      <Heading id={id} className="mt-2 text-3xl font-bold sm:text-4xl">
        {title}
      </Heading>
      <div
        className={cn("bg-primary mt-4 h-1 w-12 rounded-full", align === "center" && "mx-auto")}
      />
      {description ? <p className="text-muted-foreground mt-4 text-lg">{description}</p> : null}
    </div>
  );
}
