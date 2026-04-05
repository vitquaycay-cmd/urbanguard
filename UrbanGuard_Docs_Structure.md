# UrbanGuard – Full Documentation Structure

## 📁 Docs Structure

```bash
docs/
│
├── plans/                    # File kế hoạch .md (Git), xem plans/README.md
│   └── .gitkeep
│
├── 00-project-init/
│   ├── overview.md
│   ├── objectives.md
│   ├── scope.md
│   ├── tech-stack.md
│   └── setup-environment.md
│
├── 01-system-design/
│   ├── system-architecture.md   # Kiến trúc hệ thống — containers, ports, boundaries
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-design.md
│   ├── module-design.md
│   ├── sequence-flow.md
│   └── security-design.md
│
├── 02-backend/
│   ├── setup-backend.md
│   ├── project-structure.md
│   ├── auth-module.md
│   ├── users-module.md
│   ├── reports-module.md
│   ├── upload-module.md
│   ├── map-module.md
│   ├── ai-module.md
│   ├── admin-module.md
│   ├── validation.md
│   ├── error-handling.md
│   └── deployment-backend.md
│
├── 03-frontend/
│   ├── setup-frontend.md
│   ├── project-structure.md
│   ├── ui-design.md
│   ├── map-integration.md
│   ├── api-integration.md
│   ├── auth-flow.md
│   ├── state-management.md
│   └── deployment-frontend.md
│
├── 04-features/
│   ├── user-features.md
│   ├── admin-features.md
│   ├── ai-features.md
│   └── map-features.md
│
├── 05-devops/
│   ├── server-setup.md
│   ├── nginx-config.md
│   ├── pm2-config.md
│   ├── database-setup.md
│   ├── backup-strategy.md
│   └── monitoring.md
│
└── README.md
```

---

## 📌 Mô tả từng phần

### 00-project-init
- Giới thiệu dự án
- Mục tiêu
- Công nghệ
- Setup môi trường

### 01-system-design
- Kiến trúc hệ thống
- Thiết kế database
- Thiết kế API
- Flow hệ thống

### 02-backend
- NestJS structure
- Module (auth, reports, users,...)
- Xử lý logic

### 03-frontend
- UI/UX
- Map (Leaflet)
- Gọi API

### 04-features
- User features
- Admin features
- AI features
- Map features

### 05-devops
- Setup server
- Nginx
- PM2
- Database
- Backup

### plans/
- File Markdown kế hoạch triển khai theo ngày/tính năng (`YYYY-MM-DD-*.md`)
- Skill **ke-hoach-trien-khai** / **thuc-hien-ke-hoach** (`.agents/skills/`)

---

## 📌 Ví dụ nội dung file

### reports-module.md

```md
# Reports Module

## Mô tả
Module xử lý báo cáo sự cố giao thông.

## Chức năng
- Tạo báo cáo
- Lấy danh sách
- Xem chi tiết
- Xác nhận

## API
POST /reports  
GET /reports  

## Flow
User → API → Database → Response
```

---

## 🎯 Kết luận

Cấu trúc này giúp:
- Dễ quản lý tài liệu
- Dễ phát triển dự án
- Chuẩn format đồ án
- Dễ đọc cho giảng viên

---

## 🚀 Slogan
UrbanGuard – Bảo vệ bạn trên mọi cung đường
