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

