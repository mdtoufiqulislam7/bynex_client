/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'picsum.photos',
      'res.cloudinary.com',
      '7ec64261da76a2f46a7c1f2d7011ab9a.r2.cloudflarestorage.com',
      'mlm.7ec64261da76a2f46a7c1f2d7011ab9a.r2.cloudflarestorage.com',
      'lh3.googleusercontent.com',
    ],
  },
  async rewrites() {
    const backendUrl =
      process.env.INTERNAL_BACKEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://bynex-server.onrender.com'
        : 'http://localhost:8000');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${backendUrl}/auth/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
