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
      // MAX_IMAGE_BYTES in lib/validations.ts); this must stay under Vercel's
      // 4.5 MB request cap.
      bodySizeLimit: "4mb",
    },
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
  images: {
    // Gallery photos uploaded through the admin live in the public Supabase
    // Storage bucket; seed photos are still served from /public.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
