# Trolly Hub

Trolly Hub is a modern full-stack supermarket POS and management system built with React, FastAPI (Python), and MongoDB / Local Persistent Store.

## Live Demo
https://trolly-hub-new.vercel.app/

## Features
- Role-based authentication: Admin, Manager, Employee, Customer
- JWT auth for staff with bcrypt password hashing
- Mobile + OTP login flow for customer (mock OTP: `123456`)
- Product management (CRUD, barcode search, category filtering)
- Stock management & change logs
- POS / billing with real-time stock decrement
- Orders and printable bills
- Reports and interactive dashboard analytics
- Responsive green and white UI with ErrorBoundary protection

## Tech Stack
- Frontend: React 18 + Vite + React Router + Axios + Recharts
- Backend: FastAPI (Python 3) + Uvicorn + Motor / Pymongo
- Auth: JWT (PyJWT) + bcrypt
- Database: MongoDB (Atlas / local) with automatic local persistent store fallback

## Folder Structure
- `client/` React frontend
- `server/` FastAPI backend

---

## Local Development

### 1) Backend (FastAPI)
```bash
cd server
pip install -r requirements.txt
python seed.py
python -m uvicorn main:app --reload --port 5000
```
Or run using npm script:
```bash
cd server
npm run dev
```

### 2) Frontend
```bash
cd client
npm install
npm run dev
```

### 3) Run Both Concurrently (Root)
```bash
npm run dev
```

## Default Demo Credentials
After running the seed command:

- Admin: `admin@trollyhub.com` / `Admin@123`
- Manager: `manager@trollyhub.com` / `Manager@123`
- Employee: `employee@trollyhub.com` / `Employee@123`

### Customer Demo
Use mobile: `9999999999`
Mock OTP: `123456`

---

## Deployment

### Backend → Render
1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `server`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `MONGO_URI` — your MongoDB Atlas connection string (optional; defaults to local persistent store if omitted)
   - `JWT_SECRET` — a strong random string
   - `CLIENT_URL` — your Vercel frontend URL (e.g. `https://trolly-hub.vercel.app`)
   - `NODE_ENV` — `production`
5. Deploy and note the Render URL

### Frontend → Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` — your Render backend URL + `/api` (e.g. `https://trollyhub-api.onrender.com/api`)
5. Deploy

---

## Automated Tests
Run the FastAPI backend test suite:
```bash
cd server
python test_suite.py
```
