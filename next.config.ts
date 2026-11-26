import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CodeSandbox Devbox previews run on <id>-<port>.csb.app; let them reach the dev server (hot reload).
  allowedDevOrigins: ["*.csb.app"],
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
