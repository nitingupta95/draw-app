import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/db", "@repo/common", "@repo/backend-common"],
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
