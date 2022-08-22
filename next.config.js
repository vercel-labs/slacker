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
      {
        source: "/privacy",
        destination: "https://vercel.com/privacy",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
