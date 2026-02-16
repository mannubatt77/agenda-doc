import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Commented out to enable API Routes on Vercel
  images: { unoptimized: true } // Required for static export
};

export default nextConfig;
