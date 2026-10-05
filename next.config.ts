import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // How it works now lives on the home page.
      { source: "/how-it-works", destination: "/#how-it-works", permanent: true },
    ];
  },
};

export default nextConfig;
