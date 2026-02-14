const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const withPWA = require("next-pwa")({
  dest: "public",
  register: false,
  skipWaiting: false,
  scope: "/",
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^\/api\/.*/,
      handler: "NetworkOnly",
      method: "GET",
    },
    {
      urlPattern: /^https:\/\/your-api-domain\.com\/.*/,
      handler: "NetworkOnly",
      method: "GET",
    },
    // Exclude HMR and webpack files from caching
    {
      urlPattern: /^\/_next\/static\/webpack\/.*/,
      handler: "NetworkOnly",
    },
    {
      urlPattern: /^\/_next\/webpack-hmr.*/,
      handler: "NetworkOnly",
    },
    {
      urlPattern: /\.(woff|woff2|ttf|otf)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "fonts",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|css|js)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /.*/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "html-pages",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
  output: "standalone",
  reactStrictMode: true,
  productionBrowserSourceMaps: true, // Enable source maps in production
  sassOptions: {
    includePaths: ["./scss"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "ilink.influe.ir", pathname: "/**" }],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 165, 200, 220, 250, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icon-:path",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/.well-known/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/appspecific/:path*",
        destination: "/404",
      },
    ];
  },
  webpack(config, { isServer, dev }) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "next/router": path.resolve(__dirname, "app/_compat/next-router.ts"),
    };

    // Fix HMR in development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules", "**/.next"],
      };
    }

    if (!dev && !isServer) {
      config.optimization.minimizer = [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true,
              pure_funcs: ["console.log", "console.info", "console.debug"], // حذف توابع کنسول
              passes: 2, // فشرده‌سازی چند مرحله‌ای
            },
            mangle: true, // فشرده‌سازی و تغییر نام متغیرها
            format: {
              comments: false, // حذف کامنت‌ها
            },
          },
          extractComments: false,
        }),
      ];
    }
    return config;
  },
});
