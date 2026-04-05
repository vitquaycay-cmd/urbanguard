tạo database
CREATE DATABASE urbanguard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

cd ai-service
py -3 -m pip install -r requirements.txt
py -3 -m uvicorn main:app --reload --port 8000

Điền vào file .env trong backend
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/urbanguard"
JWT_SECRET=supersecretkey123

cd backend
npm install ( nếu lỗi chạy npm install --force)
npx prisma generate
npx prisma migrate dev
npm run start:dev

cd frontend
npm run dev
