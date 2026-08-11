import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Local QA opens the development server at 127.0.0.1 while Next initializes
  // it as localhost. Allow that explicit loopback origin so HMR and Client
  // Component hydration are not rejected during development.
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingExcludes: {
    "/media/*": [
      "./next.config.ts",
      "./.ai/**/*",
      "./prisma/**/*",
      "./storage/**/*",
      "./tests/**/*",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              // Next.js development tooling evaluates source-mapped code to hydrate
              // Client Components. Keep this exception strictly local to development;
              // production continues to block eval.
              `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}`,
              "media-src 'self'",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
