import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Use the environment variable or fallback to the public API URL when deployed
    FASTAPI_BASE_URL: process.env.FASTAPI_BASE_URL || 
                      process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || 
                      'http://localhost:8000'
  },
  // Allow connecting to the FastAPI server from Vercel
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 
          `${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || 'http://localhost:8000'}/:path*`,
      },
    ]
  }
};

export default nextConfig;
