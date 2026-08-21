/** @type {import('next').NextConfig} */


const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',
  assetPrefix: './',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  turbopack: {
    root: process.cwd(),
  },

  sassOptions: {
    loadPaths: ["./node_modules/bootstrap/scss/", "./src/pages/"],
    silenceDeprecations: ['import', 'if-function', 'global-builtin'],
  },

};

export default nextConfig;
