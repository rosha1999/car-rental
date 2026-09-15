/** @type {import("next").NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol:"https", hostname:"**" }] },
  experimental: {},
};
module.exports = nextConfig;