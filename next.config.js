/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  async rewrites() {
    return []
  }
}

module.exports = nextConfig