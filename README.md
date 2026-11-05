# Golden Gem Manager - MERN Separated

This version keeps the existing Golden Gem Manager frontend and backend features while separating them into independent applications.

## Structure

- `frontend/` - React + Vite + TanStack Router UI
- `backend/` - Node.js + Express + MongoDB/Mongoose API

## Run frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: http://localhost:8080

## Run backend

```powershell
cd backend
npm install
npm run dev
```

Backend: http://localhost:5000

The frontend API base URL is configured through `frontend/.env`:

`VITE_API_URL=http://localhost:5000/api`
