/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double-mounting canvas RAF loops in dev
  transpilePackages: ['@whiteboard/shared'],
};

export default nextConfig;
