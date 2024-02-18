/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/lingq/local/:path*',
        destination: 'https://fsrs.parallelveil.com/api/lingq/:path*',
      },
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
};

module.exports = nextConfig;
