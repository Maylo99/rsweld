"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type FaqAccordionProps = {
  items: FaqItem[];
  /** Open the first question initially. */
  openFirst?: boolean;
  /** Prefix each question with its position (01, 02…). */
  numbered?: boolean;
  className?: string;
};

/*
 * FAQ list as card-style accordion items; one answer open at a time.
 */
export function FaqAccordion({
  items,
  openFirst = false,
  numbered = false,
  className,
}: FaqAccordionProps) {
  return (
    <Accordion
      defaultValue={openFirst && items[0] ? [items[0].id] : []}
      className={cn("gap-3", className)}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="border-border bg-card data-open:border-primary/40 hover:border-primary/30 rounded-xl border px-5 transition-[border-color,box-shadow] not-last:border-b data-open:shadow-md"
        >
          <AccordionTrigger className="items-center gap-4 py-4 text-base font-semibold hover:no-underline">
            <span className="flex items-baseline gap-3">
              {numbered ? (
                <span className="text-primary font-heading text-sm tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : null}
              <span>{item.question}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "text-muted-foreground pb-5 text-[0.95rem] leading-relaxed",
              numbered && "sm:pl-8",
            )}
          >
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
