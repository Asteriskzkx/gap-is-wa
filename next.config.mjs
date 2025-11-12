/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Ensure webpack treats .geojson files as JSON so they can be imported from src/
  // without adding a custom loader package.
  webpack: (config) => {
    // Add rule: parse .geojson as json (webpack 5 built-in json type)
    config.module.rules.push({
      test: /\.geojson$/,
      type: "json",
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;
