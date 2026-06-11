# Threads Clone — Admin Panel

## Tổng quan
Frontend quản trị riêng cho Threads Clone. Gọi API từ backend Threads Clone.
Repo chính: threads-clone (backend port 5000)

## Tech stack
- Next.js 14 App Router + TailwindCSS
- File extension: .js (không TypeScript)
- Port: 3001

## Kết nối Backend
- Local: http://localhost:5000/api/v1
- Production: https://<render-url>/api/v1
- Env: NEXT_PUBLIC_API_URL

## Auth
- Chỉ ADMIN mới vào được (role: "ADMIN")
- JWT lưu localStorage: accessToken, refreshToken, user
- Tự động refresh token khi hết hạn 15 phút
- Redirect về /login nếu không có token hoặc không phải ADMIN

## API endpoints dùng trong Admin Panel
- POST /auth/login — đăng nhập
- POST /auth/refresh-token — refresh token
- GET  /admin/stats — dashboard thống kê
- GET  /admin/users — danh sách users (?page&limit&search&role&banned)
- PATCH /admin/users/:id/ban — ban/unban
- PATCH /admin/users/:id/role — đổi role
- DELETE /admin/users/:id — xóa user
- GET  /admin/posts — danh sách posts (?page&limit&search)
- DELETE /admin/posts/:id — xóa post
- GET  /admin/reports — danh sách reports (?page&limit&status)
- PATCH /admin/reports/:id/resolve — xử lý report

## Response format
{ success, data, message }

## Cấu trúc thư mục
app/
  login/page.js
  dashboard/page.js
  users/page.js
  posts/page.js
  reports/page.js
  layout.js
components/
  layout/Sidebar.js
  layout/Header.js
  ui/Table.js
  ui/Pagination.js
  ui/Badge.js
  ui/Modal.js
lib/
  api.js — fetchAPI với auto-refresh token
  auth.js — getToken, saveToken, clearToken, isAdmin

## Quy ước code
- Response check: if (data?.success)
- Mọi page đều check isAdmin() khi mount, redirect /login nếu không hợp lệ
- Toast thông báo cho mọi thao tác CRUD
- Tailwind dark mode: dark:...
- Không dùng TypeScript
