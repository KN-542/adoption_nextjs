/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja',
  },
  staticPageGenerationTimeout: 300,
}

module.exports = nextConfig
