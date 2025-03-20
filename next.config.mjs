// Try to import next-pwa with a fallback
let withPWA;
try {
  withPWA = (await import('next-pwa')).default;
} catch (e) {
  // Fallback function if next-pwa is not installed
  withPWA = (config) => config;
  console.warn('next-pwa package not found, PWA features will be disabled');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['txndzhjxsijyjeuoqfxl.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Default loader for Next.js works fine with Netlify
    unoptimized: false,
  },
  // Output standalone to ensure all dependencies are included
  output: 'standalone',
  // Optimize build size
  compress: true,
  poweredByHeader: false,
  // Other settings
  trailingSlash: true,
  reactStrictMode: true,
  // Add experimental settings to reduce function size
  experimental: {
    // Optimize bundle size
    optimizeCss: true
  },
  // Configure webpack to minimize bundle size
  webpack: (config, { isServer }) => {
    // Optimize chunks for serverless
    if (isServer) {
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
          vendors: false
        }
      };
    }
    
    return config;
  }
}

// Apply PWA configuration
const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);

export default config;
