# SouqFlow

SouqFlow helps sellers manage products, inventory, customer orders, and sales, with a public catalog customers can browse and order from.

## Main features

- Account registration and sign-in, user/admin roles, and subscription access.
- Products and categories with SKUs, color/size options, stock quantities, and low-stock alerts.
- Public seller catalogs at `/catalog/[sellerId]`, product visibility, popular products, and drag-and-drop ordering.
- Manual orders and storefront requests, delivery status, payment tracking, and PDF receipts.
- Sales analytics and USD/LBP currency display with a configurable exchange rate.
- Business profiles, logos, social links, profile photos, notifications, and notification history.
- Image uploads through Vercel Blob.

## Technologies used

| Area | Technologies |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS, Lucide/React Icons, dnd-kit |
| Database | PostgreSQL, Prisma ORM 6 |
| Authentication | Auth.js / NextAuth v5, Prisma adapter, bcryptjs |
| Forms and state | React Hook Form, Zod, Zustand |
| Charts and PDFs | Chart.js, react-chartjs-2, jsPDF, jspdf-autotable |
| Storage and scheduling | Vercel Blob, node-cron |
| Development | npm, ESLint, tsx, concurrently |

## Project setup

### 1. Install dependencies

Install Node.js 20.9 or newer with npm, and have a running PostgreSQL database. From the repository root:

```bash
npm ci
```

### 2. Configure environment variables

Create a `.env` file in the repository root with your own values:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/souqflow?schema=public"
AUTH_SECRET="your-generated-secret"
BLOB_READ_WRITE_TOKEN="your-blob-token"
```

Configure these variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma and the application. |
| `AUTH_SECRET` | Random Auth.js secret; `NEXTAUTH_SECRET` is also supported. |
| `BLOB_READ_WRITE_TOKEN` | Required for uploads to a connected public Vercel Blob store. |

Generate an authentication secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Keep `DATABASE_URL` in `.env` so the Prisma CLI can load it through `prisma.config.ts`. Next.js also loads this file. Local `.env*` files are ignored by Git. Keep secrets server-only and never prefix them with `NEXT_PUBLIC_`.

### 3. Initialize the database

Create an empty PostgreSQL database matching `DATABASE_URL`, then generate the Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

For optional local demo accounts and sample data:

```bash
npx tsx prisma/seed.ts
```

The seed contains fixed demo credentials; use it only with a local development database. See `prisma/seed.ts` for demo account details. Newly registered accounts start with an inactive subscription; complete the subscription flow to access protected features.

### 4. Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). This starts Next.js and the notification scheduler, which checks low stock daily at midnight in the host's timezone while running.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development and the notification scheduler. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Build the production application. |
| `npm start` | Serve the production build. |
| `npx prisma studio` | Browse the configured database. |

## Project structure

- `app/`: pages, layouts, public catalogs, dashboard, and API routes.
- `lib/`: authentication, Prisma client, validation, and order/stock utilities.
- `prisma/`: database schema, migrations, and optional seed data.
- `scripts/`: low-stock scheduler and maintenance scripts.

## Deployment

Configure `DATABASE_URL`, `AUTH_SECRET`, and (for uploads) `BLOB_READ_WRITE_TOKEN` in the deployment environment. Generate the Prisma client and apply migrations before serving the application. Build with `npm run build` and serve with `npm start`.

On Vercel, create a **public** Blob store in the project's Storage tab and connect it. Ensure its token is available in each environment that needs uploads, then redeploy. Image pickers accept JPEG, PNG, WebP, and GIF files up to 4 MB. The database stores public Blob URLs; editing without a replacement preserves the existing image.

Leave `AUTH_URL` and `NEXTAUTH_URL` unset on Vercel so Auth.js can infer deployment domains, including previews. If explicitly configured, use the public HTTPS domain. Redeploy after changing environment variables.

`npm start` does not start the notification scheduler. Run `npx tsx scripts/notification-cron.ts` in a persistent worker with the same database configuration for scheduled production low-stock checks.
