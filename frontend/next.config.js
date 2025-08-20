/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static site generation for GitHub Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3333/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
