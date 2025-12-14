/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    KESTRA_API_URL: process.env.KESTRA_API_URL || 'http://kestra:8080',
  },
}

module.exports = nextConfig