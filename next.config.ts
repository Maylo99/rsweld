import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project — a stray lockfile higher up the
  // filesystem otherwise makes Next infer the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      // The gallery used to live at /realizacie — keep old links and rankings.
      { source: "/realizacie", destination: "/galeria", permanent: true },
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
