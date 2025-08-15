/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-webth.garenanow.com',
        port: '',
        pathname: '/webth/cdn/garena/icon/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/th',
        permanent: false,
      },
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
