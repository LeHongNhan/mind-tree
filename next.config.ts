/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['reactflow', '@reactflow/core', '@reactflow/background', '@reactflow/controls', '@reactflow/minimap'],
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
}

export default nextConfig
