import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
