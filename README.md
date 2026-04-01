# EVENTRO

Full‑stack event management platform.

## Repo structure

- `backend/` — Node.js/Express API
- `frontend/` — Vite + React web app

## Prerequisites

- Node.js 18+ (recommended)
- npm (ships with Node)

## Quick start

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

The API will start on the port configured in your environment (commonly `5000`).

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite will print the local URL (commonly `http://localhost:5173`).

## Configuration (environment variables)

Create a `.env` file in `backend/` for server configuration. Typical variables for this project may include:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

If you use third‑party services, you may also need:

- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Email (SMTP): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- WhatsApp provider credentials (if enabled)

Note: variable names can vary depending on the implementation in `backend/src/config/`.

## Useful scripts

### Backend

- `npm run dev` — start API in watch mode (if configured)
- `node scripts/createAdmin.js` — create an admin user (if configured)

### Frontend

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build locally

## Branches

This repository uses multiple long‑lived branches (e.g. `main`, feature branches). Keep them updated by merging `main` into feature branches regularly.

## Vercel Deployment

Deploy as two separate Vercel projects.

### 1) Backend project

1. Import the repository into Vercel.
2. Set Root Directory to `backend`.
3. Keep framework preset as `Other`.
4. Add backend environment variables from `backend/.env.example`.
5. Deploy.

Verify backend:

- `https://<your-backend>.vercel.app/`
- `https://<your-backend>.vercel.app/api`
- `https://<your-backend>.vercel.app/api/events`

### 2) Frontend project

1. Import the same repository again as another Vercel project.
2. Set Root Directory to `frontend`.
3. Framework preset: `Vite`.
4. Add environment variable:
	- `VITE_BACKEND_URL=https://<your-backend>.vercel.app`
5. Deploy.

### 3) Redeploy order

1. Deploy backend first.
2. Set `VITE_BACKEND_URL` in frontend project.
3. Deploy frontend.

### 4) Troubleshooting

- If frontend routes like `/events` show 404, confirm frontend Root Directory is `frontend` and `frontend/vercel.json` is present.
- If API calls show 404 in browser console, verify frontend `VITE_BACKEND_URL` points to backend Vercel URL.
- If backend functions fail, inspect Vercel Function Logs for stack traces and missing environment variables.

## License

Add license information here if/when applicable.
