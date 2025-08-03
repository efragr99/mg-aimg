// next.config.ts

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignora errores ESLint en producción
  },
  experimental: {
    middleware: true,
  },
}

export default nextConfig
