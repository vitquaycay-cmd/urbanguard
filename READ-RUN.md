tạo database
CREATE DATABASE urbanguard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

cd ai-service
py -3 -m pip install -r requirements.txt
py -3 -m uvicorn main:app --reload --port 8000

cd frontend-v2
npm run build
npm run dev

chạy database khởi tạo file
npx prisma generate
tạo Prisma Client
npx prisma migrate dev
tạo & cập nhật database
npm run start:dev

backend
npx prisma studio
kiểm tra csdl
npx prisma migrate dev
