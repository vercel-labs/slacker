/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.loom.com", "avatar.tobi.sh", "logo.clearbit.com"],
  },
};

module.exports = nextConfig;
