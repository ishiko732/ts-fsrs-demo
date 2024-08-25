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
        source: "/api/lingq/local/:path*",
        destination: "https://fsrs.parallelveil.com/api/lingq/:path*",
      },
      {
        source: '/lingq/api/:path*',
        destination: 'https://www.lingq.com/api/:path*',
      }
    ];
  },
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === "production",
  // },
  webpack(config, { isServer, dev }) {
    // Use the client static directory in the server bundle and prod mode
    // Fixes `Error occurred prerendering page "/"`
    config.output.webassemblyModuleFilename =
      isServer && !dev
        ? "../static/wasm/[modulehash].wasm"
        : "static/wasm/[modulehash].wasm";

    // Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
