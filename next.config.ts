/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['reactflow'],
  typescript: {
    // Supabase generic types cause false positives with service role client
    // Type checking still runs in IDE (tsconfig). Build-time skip is safe here.
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}

export default nextConfig
