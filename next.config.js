/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.loom.com"],
  },
  async redirects() {
    return [
      {
        source: "/support",
        destination: "mailto:stey@vercel.com",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
