# Deploying LifeDesk to Render

LifeDesk is a single combined app: the Express server serves both the built
React frontend and the `/api` routes, backed by PostgreSQL. This deploys as
**one Render web service** using an external **Neon** Postgres database.

## Prerequisites
- The code pushed to a GitHub repo (branch: `new-theme-development`).
- A free [Render](https://render.com) account.
- A [Neon](https://neon.tech) Postgres database (connection string ready). The
  schema is already created by `npm run migrate`.

## One-time deploy (Blueprint — recommended)

1. Push this repo to GitHub.
2. In Render: **New +** → **Blueprint**.
3. Select your repo and the `new-theme-development` branch.
4. Render reads [`render.yaml`](./render.yaml) and shows the **lifedesk** web service.
5. When prompted, paste your **Neon connection string** into `DATABASE_URL`
   (it is deliberately not stored in the repo). `JWT_SECRET` is auto-generated.
6. Click **Apply**. Render will build the app, run migrations, and start the server.
7. When it's live, open the service URL (e.g. `https://lifedesk.onrender.com`),
   create an account, and start adding assets.

## Manual setup (without the Blueprint)

1. **Web service:** New + → Web Service → connect the repo. Set:
   - **Root Directory:** `Life Desk`
   - **Build Command:** `npm --prefix server install && npm --prefix client install && npm --prefix client run build`
   - **Start Command:** `npm --prefix server run migrate && npm --prefix server run start`
   - **Health Check Path:** `/api/health`
   - **Environment variables:**
     - `DATABASE_URL` = your Neon connection string (`postgresql://…?sslmode=require`)
     - `JWT_SECRET` = any long random string
     - `NODE_ENV` = `production`
2. Deploy.

> The Neon string has `-pooler` in the host, which uses Neon's connection
> pooler — the right choice for a hosted app. SSL is handled automatically by
> `db.js` (`ssl: { rejectUnauthorized: false }`).

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
