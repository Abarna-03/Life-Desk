# Deploying LifeDesk to Render

LifeDesk is a single combined app: the Express server serves both the built
React frontend and the `/api` routes, backed by PostgreSQL. This deploys as
**one web service + one managed database** on Render.

## Prerequisites
- The code pushed to a GitHub repo (branch: `new-theme-development`).
- A free [Render](https://render.com) account.

## One-time deploy (Blueprint — recommended)

1. Push this repo to GitHub.
2. In Render: **New +** → **Blueprint**.
3. Select your repo and the `new-theme-development` branch.
4. Render reads [`render.yaml`](./render.yaml) and shows two resources:
   - **lifedesk** — the Node web service (app + API)
   - **lifedesk-db** — a PostgreSQL database
5. Click **Apply**. Render will:
   - provision the database,
   - run the build (`npm install` + `vite build`),
   - run migrations and start the server.
6. When it's live, open the service URL (e.g. `https://lifedesk.onrender.com`).
   Create an account and start adding assets.

`DATABASE_URL` and `JWT_SECRET` are wired automatically by the Blueprint — you
don't set them by hand.

## Manual setup (without the Blueprint)

1. **Database:** New + → PostgreSQL (free). Copy its **Internal Database URL**.
2. **Web service:** New + → Web Service → connect the repo. Set:
   - **Root Directory:** `Life Desk`
   - **Build Command:** `npm --prefix server install && npm --prefix client install && npm --prefix client run build`
   - **Start Command:** `npm --prefix server run migrate && npm --prefix server run start`
   - **Health Check Path:** `/api/health`
   - **Environment variables:**
     - `DATABASE_URL` = the Internal Database URL from step 1
     - `JWT_SECRET` = any long random string
     - `NODE_ENV` = `production`
3. Deploy.

## Notes
- **First request may be slow** on the free tier — services spin down when idle
  and cold-start on the next hit (~30s). Upgrade the plan to keep it warm.
- **Free Postgres expires after 90 days** on Render; back up or upgrade before then.
- **Migrations** run on every start and are idempotent (`CREATE TABLE IF NOT EXISTS`),
  so no data is lost on redeploy.
- **Email (password reset)** is optional — set the `SMTP_*` vars only if you want it.
- The server auto-detects `DATABASE_URL` (with SSL) in production and falls back
  to the local `DB_*` vars from `.env` for local development.

## Local development
```bash
cd "Life Desk"
npm run install:all     # root + server + client deps
cp server/.env.example server/.env   # then fill in local DB creds
npm run migrate         # create tables
npm run dev             # server :5000 + client :5173 (HMR)
```
Or run the combined production build locally: `npm start` → http://localhost:5000
