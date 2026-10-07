import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project — a stray lockfile higher up the
  // filesystem otherwise makes Next infer the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    serverActions: {
      // Admin photo uploads. Photos are downscaled in the browser first (see
      // MAX_IMAGE_BYTES in lib/validations.ts), so a few MB is plenty.
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    // Keep non-canonical hosts (e.g. the *.up.railway.app domain) out of search
    // results - only SITE_URL's host (with or without www) may be indexed.
    const host = new URL(process.env.SITE_URL || "https://rsweld.sk").hostname.replace(
      /^www\./,
      "",
    );
    return [
      {
        source: "/:path*",
        missing: [{ type: "host", value: `(www\\.)?${host.replaceAll(".", "\\.")}` }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
  async redirects() {
    return [
      // The gallery used to live at /realizacie — keep old links and rankings.
      { source: "/realizacie", destination: "/galeria", permanent: true },
      // The quote request form was merged into the contact page.
      { source: "/cenova-ponuka", destination: "/kontakt#dopyt", permanent: true },
      { source: "/admin/realizacie/:path*", destination: "/admin", permanent: false },
    ];
  },
};

export default nextConfig;
