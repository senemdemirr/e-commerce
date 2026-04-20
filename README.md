# 🛒 E-Commerce Demo

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge&logo=vercel)](https://e-commerce-taupe-xi-67.vercel.app/)


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Setup

Use the env files with Next.js' built-in mode-specific loading:

- `npm run dev` loads `.env.development.local`
- `npm run build` and `npm run start` load `.env.production.local`
- `.env.local` is now reserved for optional overrides shared by both modes

Notes:

- Keep local/sandbox credentials in `.env.development.local`
- Keep production credentials and URLs in `.env.production.local`
- Set `DATABASE_SSL=false` for local PostgreSQL and `DATABASE_SSL=true` in production
- If your production PostgreSQL provider requires SSL but uses a managed certificate chain, `DATABASE_SSL_REJECT_UNAUTHORIZED=false` is usually the practical setting

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
