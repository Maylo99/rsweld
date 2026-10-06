import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";

import { InstagramIcon } from "@/components/shared/instagram-icon";
import { Logo } from "@/components/shared/logo";
import { SteelBackdrop } from "@/components/shared/steel-backdrop";
import { mainNav, siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark bg-background text-foreground border-border relative mt-auto overflow-hidden border-t">
      <SteelBackdrop glow="bottom-left" fadeFrom="bottom" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="space-y-3">
          <Logo className="text-2xl" />
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            {siteConfig.description}
          </p>
        </div>

        {/* Quick links */}
        <nav className="space-y-3" aria-label="Rýchle odkazy">
          <p className="text-sm font-semibold tracking-wide uppercase">Menu</p>
          <ul className="space-y-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-wide uppercase">Kontakt</p>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="text-muted-foreground">{siteConfig.owner}</span>
            </li>
            <li>
              <a
                href={siteConfig.phoneHref}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
              >
                <PhoneIcon className="text-primary size-4" aria-hidden />
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.emailHref}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
              >
                <MailIcon className="text-primary size-4" aria-hidden />
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
              >
                <InstagramIcon className="text-primary size-4" aria-hidden />
                {siteConfig.instagramHandle}
              </a>
            </li>
          </ul>
        </div>

        {/* Service area */}
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-wide uppercase">Oblasť pôsobenia</p>
          <p className="text-muted-foreground inline-flex items-start gap-2 text-sm leading-relaxed">
            <MapPinIcon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {siteConfig.serviceArea}. Po dohode aj ďalšie regióny - závisí od rozsahu zákazky.
            </span>
          </p>
        </div>
      </div>

      <div className="relative border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs sm:flex-row sm:justify-between">
          <p>
            © {year} {siteConfig.name}. Všetky práva vyhradené.
          </p>
          <p>
            {siteConfig.owner} · {siteConfig.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
