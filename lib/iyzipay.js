const Iyzipay = require('iyzipay');
try { require('postman-request'); } catch (e) { } // Force Vercel to trace/bundle this dependency


const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL
});

export default iyzipay;
