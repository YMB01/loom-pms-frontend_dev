/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // macOS: if routes 404 in dev with "EMFILE: too many open files", run `ulimit -n 10240`
  // in the same terminal, or keep WATCHPACK_POLLING=true (see package.json `dev` script).
  // Hide X-Powered-By: Next.js in production responses
  poweredByHeader: false,

  /**
   * Dev only: browser calls same-origin `/api-proxy/*` → Laravel `127.0.0.1:8000/api/*`.
   * Avoids ERR_NETWORK when the SPA cannot reach port 8000 directly (IPv6/localhost issues).
   */
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://pms.loomsolutions.net/api/:path*",
      },
    ];
  },

  // Reduce file watchers in dev (helps with EMFILE / "too many open files" on some systems)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 2000,
        aggregateTimeout: 600,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
