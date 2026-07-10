/**
 * Central site metadata & navigation. Final copy/content is filled in the
 * next phase — these are skeleton values.
 */
export const siteConfig = {
  name: "RSweld",
  description: "Zváranie nerezových komponentov a výroba nerezových zábradlí — Považská Bystrica.",
  location: "Považská Bystrica, Slovensko",
  url: "https://rsweld.sk",
} as const;

export type NavItem = {
  href: string;
  label: string;
};

export const mainNav: NavItem[] = [
  { href: "/", label: "Domov" },
  { href: "/realizacie", label: "Realizácie" },
  { href: "/cenova-ponuka", label: "Cenová ponuka" },
  { href: "/kontakt", label: "Kontakt" },
];
