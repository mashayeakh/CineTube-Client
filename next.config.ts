import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Admin movie creation posts FormData including poster files.
      // The default 1MB Server Action limit is too small for production uploads.
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    const backendBaseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!backendBaseUrl) {
      return [];
    }

    const normalizedBaseUrl = backendBaseUrl.replace(/\/$/, "");

    return [
      {
        source: "/api/auth/:path*",
        destination: `${normalizedBaseUrl}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
