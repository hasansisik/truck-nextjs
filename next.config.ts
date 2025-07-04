import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'dbw3ozdoh.cloudinary.com'],
    unoptimized: true,
  },
};

export default nextConfig;
