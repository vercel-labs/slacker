/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.loom.com"],
  },
  async rewrites() {
    return [
      {
        source: "/assets/demo.mp4",
        destination:
          "https://assets.vercel.com/video/upload/v1677175120/random/slacker.mp4",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/vercel-labs/slacker",
        permanent: true,
      },
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
