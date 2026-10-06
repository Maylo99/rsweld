/**
 * Central site metadata, contact details & navigation.
 * Visible strings are Slovak (site content); identifiers stay English.
 */
export const siteConfig = {
  name: "RSweld",
  description:
    "Zváranie nerezu aj ocele - zábradlia, konštrukcie a komponenty na mieru. Považská Bystrica a okolie.",
  location: "Považská Bystrica, Slovensko",
  serviceArea: "Považská Bystrica a okolie (Trenčiansky kraj)",
  url: "https://rsweld.sk",
  owner: "René Slávik",
  phone: "+421 911 533 066",
  phoneHref: "tel:+421911533066",
  email: "rsweldsk@gmail.com",
  emailHref: "mailto:rsweldsk@gmail.com",
  instagram: "https://instagram.com/rsweldsk",
  instagramHandle: "@rsweldsk",
} as const;

export type NavItem = {
  href: string;
  label: string;
};

export const mainNav: NavItem[] = [
  { href: "/", label: "Domov" },
  { href: "/o-nas", label: "O nás" },
  { href: "/galeria", label: "Galéria" },
  { href: "/caste-otazky", label: "Časté otázky" },
  { href: "/cenova-ponuka", label: "Cenová ponuka" },
  { href: "/kontakt", label: "Kontakt" },
];
