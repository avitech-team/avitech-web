/** @type {import('next').NextConfig} */
const nextConfig = {
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
  