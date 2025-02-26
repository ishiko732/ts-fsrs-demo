/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
    ],
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/lingq/:path*',
          destination: 'https://www.lingq.com/:path*',
        },
      ],
    };
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
export default nextConfig;
