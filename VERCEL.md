# Deploying Loom PMS frontend on Vercel

The app uses **`next.config.mjs`** (Next.js supports `.mjs` the same as `next.config.js`).

## `vercel.json`

`vercel.json` sets the **Next.js** framework, `npm install`, and `npm run build`. Vercel also auto-detects Next.js if you omit this file.

If this repo is a **monorepo**, create the Vercel project with **Root Directory** = `loom-pms-frontend` (or run the CLI from that folder).

## Environment variables (Vercel dashboard)

Add under **Project → Settings → Environment Variables**. Apply to **Production** (and **Preview** if your API has a staging URL).

| Variable | Required | Example | Notes |
|----------|----------|---------|--------|
| `NEXT_PUBLIC_API_URL` | **Yes** | `https://api.example.com/api` | Public Laravel API base URL **including** `/api`. Must match CORS / Sanctum config on the API. No trailing slash required (it is normalized). |

`NEXT_PUBLIC_*` variables are inlined at **build** time. After changing them, **redeploy** so the new values are picked up.

### Optional (only if you add features that need them)

| Variable | Notes |
|----------|--------|
| *(none required today)* | All data access goes through `NEXT_PUBLIC_API_URL` via `src/lib/api.ts`. |

## Deploy with Vercel CLI

From the **frontend app directory** (`loom-pms-frontend`):

1. **Install the CLI**

   ```bash
   npm install -g vercel
   ```

2. **Log in**

   ```bash
   vercel login
   ```

   Complete the browser or email flow when prompted.

3. **First-time link (optional preview)**

   ```bash
   cd loom-pms-frontend
   vercel
   ```

   Answer prompts: link to a project (or create one), confirm scope, set root if asked.

4. **Production deploy**

   ```bash
   vercel --prod
   ```

This runs install/build using `vercel.json` and deploys to your production domain.

### Monorepo

Either:

- Run the commands above from `loom-pms-frontend`, **or**
- From the repo root: `vercel --prod --cwd loom-pms-frontend` (Vercel CLI supports targeting a subdirectory; alternatively set **Root Directory** in the project settings once).

## API + CORS checklist

1. Set **`NEXT_PUBLIC_API_URL`** on Vercel to your deployed Laravel URL with `/api`.
2. On the Laravel API, set **`CORS_ALLOWED_ORIGINS`** / **`FRONTEND_URL`** to your Vercel URL(s) (e.g. `https://your-app.vercel.app`).
3. For Sanctum cookie auth (if used), align **`SANCTUM_STATEFUL_DOMAINS`** with the Vercel hostname. This app uses **Bearer tokens** in cookies via `loom_pms_token`; ensure the API accepts your Vercel origin for CORS.
