import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getLocalBusinessJsonLd } from "@/lib/json-ld";

/** Chrome for the public-facing site (everything except `/admin`). */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getLocalBusinessJsonLd()) }}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
