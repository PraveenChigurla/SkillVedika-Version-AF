/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable strict type checking in production builds
    ignoreBuildErrors: false,
  },
  images: {
    // Enable image optimization for better performance
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for images
    qualities: [75, 85], // Add quality 85 to supported qualities
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Optimize image loading for better LCP
    unoptimized: false,
    // Configure remote image patterns for external image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
    ],
    // Removed contentSecurityPolicy from image config as it's not needed and causes warnings
    // CSP should be set at the application level, not per image
  },
  // Security headers are handled in middleware.ts for better control
  // This is kept as fallback for static assets
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  // Performance optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  // Note: SWC minification and font optimization are enabled by default in Next.js 16
  // Experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled - requires 'critters' package
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion',
      'react-phone-input-2',
      // Removed react-icons/fa - replaced with lucide-react icons
    ],
  },
  // Server external packages (moved from experimental in Next.js 16+)
  serverExternalPackages: [],
  // Optimize compiler settings
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Webpack configuration for production optimizations (only used if Turbopack is disabled)
  // Note: In dev mode with Turbopack, webpack config is ignored
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack config in production or when Turbopack is disabled
    if (dev) {
      // In dev mode, optimize file watching to prevent continuous compilation
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/out/**',
          '**/build/**',
          '**/.git/**',
          '**/coverage/**',
          '**/*.log',
          '**/.DS_Store',
        ],
        aggregateTimeout: 300,
        poll: false, // Disable polling on Windows to reduce CPU usage
      };
      return config;
    }

    // Exclude Next.js devtools from ALL builds (dev and production)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@next/devtools': false,
        'next/dist/compiled/next-devtools': false,
        'next/dist/compiled/@next/devtools': false,
      };
      // Exclude devtools from bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@next/devtools': false,
      };
      // Exclude devtools from externals
      if (config.externals) {
        config.externals = Array.isArray(config.externals)
          ? [...config.externals, '@next/devtools']
          : [config.externals, '@next/devtools'];
      } else {
        config.externals = ['@next/devtools'];
      }
    }
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Separate vendor chunks for better caching
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
                return `npm.${packageName?.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  // Turbopack configuration (used in dev mode)
  // Note: Turbopack doesn't support boolean values in resolveAlias
  // Devtools exclusion is handled via webpack config for production builds
  turbopack: {},
  // Note: Turbopack handles code splitting and optimization automatically in dev mode
  // Devtools exclusion is handled via webpack config for production builds
}

export default nextConfig
