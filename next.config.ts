import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: [
    "bullmq",
    "ioredis",
    "pg",
    "@prisma/client",
    "@prisma/adapter-pg",
    "openai",
    "@ai-sdk/openai",
    "@ai-sdk/google",
  ],
};

export default nextConfig;

