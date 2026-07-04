# AthithyaOS

A restaurant operating system with a FastAPI backend and a React (Create React App + Craco) frontend, backed by MongoDB.

## Modules

Dashboard · POS · KDS (Kitchen Display System) · Tables · Inventory · Staff · Reservations · Revenue · AI Insights · Settings

## Prerequisites

- **Node.js** (v18+ recommended) and npm
- **Python** 3.11+ and pip
- A **MongoDB** database — either:
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster (recommended, no local install needed), or
  - MongoDB installed locally

## Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd AthithyaOS
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

> Note: if `emergentintegrations==0.2.0` in `requirements.txt` fails to install, delete that line — it's a private package from the original platform this project was scaffolded on and isn't used anywhere in `server.py`.

Copy the example env file and fill in your real values:

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URL="your-mongodb-connection-string-here"
DB_NAME="athithya_os"
CORS_ORIGINS="*"
JWT_SECRET="generate-a-random-secret-string-here"
```

Start the backend:
```bash
python -m uvicorn server:app --reload --port 8001
```

You should see:
```
INFO:     Application startup complete.
```

The first run seeds the database automatically (users, menu, tables, inventory, staff, reservations, orders).

### 3. Frontend setup

Open a **new terminal**, keeping the backend running:

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

This opens `http://localhost:3000` automatically.

## Running the app after initial setup

Once dependencies are installed, every subsequent run is just:

**Terminal 1:**
```bash
cd backend
python -m uvicorn server:app --reload --port 8001
```

**Terminal 2:**
```bash
cd frontend
npm start
```

## Login credentials

See `memory/test_credentials.md` for seeded demo login credentials.

## Security notes

- Never commit your real `.env` files — they're already excluded via `.gitignore`.
- If any secret (MongoDB password, JWT secret) has ever been shared outside this repo (e.g. in chat, a screenshot, a support ticket), rotate it before/after making the repo public.
- If using MongoDB Atlas, restrict Network Access to trusted IPs where possible instead of `0.0.0.0/0` for anything beyond local testing.

## Tech stack

- **Frontend:** React, Craco, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Lucide icons
- **Backend:** FastAPI, Motor (async MongoDB driver), PyJWT, Passlib/bcrypt
- **Database:** MongoDB
