import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained build that needs neither node_modules nor the
  // source tree at runtime — the Dockerfile's runner stage copies only this.
  output: "standalone",
};

export default nextConfig;
