/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['iyzipay'],
    outputFileTracingIncludes: {
        '/api/checkout': [
            'node_modules/iyzipay/lib/resources/**',
            'node_modules/iyzipay/lib/requests/**'
        ],
        '/api/payment': [
            'node_modules/iyzipay/lib/resources/**',
            'node_modules/iyzipay/lib/requests/**'
        ]
    }
};

export default nextConfig;
