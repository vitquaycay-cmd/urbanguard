# Run Guide

Use this guide for local development. Run each app from its own directory.

## 1. Database

Create a MySQL database:

```sql
CREATE DATABASE urbanguard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Configure `backend/.env` with `DATABASE_URL`, JWT secrets, and `AI_SERVICE_URL`.

## 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Useful backend commands:

```bash
npm test
npx tsc --noEmit
npm run build
npx prisma studio
```

Default URLs:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Uploads: `http://localhost:3000/uploads/...`

## 3. AI Service

```bash
cd urbanguard-ai
py -3 -m pip install -r requirements.txt
py -3 -m uvicorn main:app --reload --host 127.0.0.1 --port 5000
```

Default backend fallback expects:

```env
AI_SERVICE_URL=http://127.0.0.1:5000
```

Useful AI URLs:

- Docs: `http://127.0.0.1:5000/docs`
- Image analysis: `POST http://127.0.0.1:5000/analyze`
- Safe route: `POST http://127.0.0.1:5000/real-safe-route`

## 4. Frontend v2

```bash
cd frontend-v2
npm install
npm run dev
```

Default Vite URL:

- `http://localhost:3002`

Optional `frontend-v2/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Useful frontend commands:

```bash
npx tsc --noEmit -p tsconfig.app.json
npm run build
npm run lint
```

Note: full frontend lint currently still reports issues outside the user/auth area.

