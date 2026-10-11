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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Product images, profile photos, and business logos use [Vercel Blob server uploads](https://vercel.com/docs/vercel-blob/server-upload). Create a **public** Blob store in your Vercel project's Storage tab and connect it to the project. Ensure `BLOB_READ_WRITE_TOKEN` is available in each deployment environment. For local development, add that token to `.env.local`; keep it server-only and never prefix it with `NEXT_PUBLIC_`. Redeploy after connecting the store.

All image fields use file pickers accepting JPEG, PNG, WebP, and GIF files up to 4 MB. The database stores the resulting public Blob URL. Existing images are preserved when editing without choosing a replacement; re-upload old images to move them into Blob storage. Saving without a new image does not require a Blob token.

Set `DATABASE_URL` and `AUTH_SECRET` (or `NEXTAUTH_SECRET`) in the Vercel project's environment variables. Leave `AUTH_URL` and `NEXTAUTH_URL` unset to let Auth.js infer the current deployment domain, including preview deployments. If you set either URL explicitly, use your public HTTPS domain, never localhost. Redeploy after changing environment variables.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
