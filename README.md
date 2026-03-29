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

## License

Add license information here if/when applicable.
