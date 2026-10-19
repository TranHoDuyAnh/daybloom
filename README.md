# DayBloom — Personal Calendar & Journal

Ứng dụng cá nhân gồm **hai chức năng duy nhất**: Lịch (Calendar) và Sổ tay nhật ký (Journal).
Toàn bộ dữ liệu lưu trong **Neon PostgreSQL**, không dùng LocalStorage.

## Stack

| Thành phần | Công nghệ |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript strict |
| UI | Tailwind CSS v4, shadcn/ui, Lucide React |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Auth.js (NextAuth v5) — Credentials + bcrypt, JWT session |
| Validation | Zod v4 + React Hook Form |
| Ngày/giờ | date-fns v4 + date-fns-tz, timezone `Asia/Ho_Chi_Minh` |
| Deploy | Vercel |

## Tính năng

**Calendar**
- 3 chế độ xem: Tháng / Tuần / Ngày
- Tạo, sửa, xóa sự kiện; sự kiện cả ngày (all-day)
- 7 category mặc định: Work, Learning, Personal, Health, Exercise, Relax, Other
- 10 màu sự kiện; xếp cột chống chồng lấn trong chế độ Tuần/Ngày
- Điều hướng bằng bàn phím: `←` `→` (đổi kỳ), `T` (hôm nay), `N` (sự kiện mới)

**Journal**
- Danh sách nhật ký + tìm kiếm toàn văn, lọc theo khoảng ngày
- Template 4 phần: A. Daily Check-in, B. Daily Reflection, C. Tomorrow, D. Free Writing
- Autosave (debounce 1.2s) với trạng thái rõ ràng: Đang lưu / Đã lưu / Lưu thất bại + nút thử lại
- Không báo "đã lưu" giả; nội dung không bị mất khi lỗi (giữ dirty state và cảnh báo khi rời trang)

**Bảo mật**
- Đăng nhập bắt buộc; middleware bảo vệ `/calendar`, `/journal`
- Có thể tạo tài khoản mới tại `/register` (email + mật khẩu ≥ 8 ký tự, hash bcrypt), hoặc dùng tài khoản tạo bằng `npm run seed`
- Mọi mutation là Server Action, kiểm tra `userId` từ session trước khi chạm DB
- Validate server-side bằng Zod; secret chỉ nằm trong biến môi trường

## Cài đặt

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo database Neon

Cách nhanh nhất là qua Vercel Marketplace (Neon), hoặc tạo project trực tiếp tại
[neon.tech](https://neon.tech) rồi lấy **connection string** (nên dùng Pooled connection).

### 3. Cấu hình biến môi trường

Sao chép `.env.example` thành `.env.local` và điền:

```bash
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"  # Neon
AUTH_SECRET="..."        # openssl rand -base64 32
AUTH_URL="http://localhost:3000"

SEED_USER_EMAIL="you@example.com"
SEED_USER_PASSWORD="mat-khau-toi-thieu-8-ky-tu"
SEED_USER_NAME="DayBloom"
```

### 4. Chạy migration

```bash
npm run db:migrate
```

### 5. Tạo tài khoản đăng nhập

```bash
npm run seed
```

### 6. Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000), đăng nhập bằng `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` — hoặc vào `/register` để tự tạo tài khoản mới.

## Scripts

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Build production |
| `npm run start` | Chạy bản production |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm run lint` | ESLint |
| `npm run db:generate` | Sinh migration từ Drizzle schema |
| `npm run db:migrate` | Áp dụng migration |
| `npm run db:push` | Đẩy schema trực tiếp (chỉ dùng khi phát triển) |
| `npm run db:studio` | Mở Drizzle Studio |
| `npm run seed` | Tạo/cập nhật tài khoản đăng nhập |

## Deploy lên Vercel

1. Push repository lên GitHub.
2. Trên Vercel: **Add New → Project**, import repo.
3. Thêm Neon: **Storage → Create Database → Neon** (hoặc dùng `DATABASE_URL` từ project Neon có sẵn).
4. Khai báo Environment Variables cho cả Production/Preview:
   - `DATABASE_URL` (Neon connection string)
   - `AUTH_SECRET` (`openssl rand -base64 32`)
   - `AUTH_URL` = domain production (ví dụ `https://daybloom.vercel.app`) — **tuyệt đối không để `http://localhost:3000`**, nếu không đăng nhập sẽ không tạo được session
   - `SEED_USER_EMAIL`, `SEED_USER_PASSWORD`, `SEED_USER_NAME`
5. Deploy.
6. Chạy migration trên database production:

```bash
DATABASE_URL="<neon-production-url>" npm run db:migrate
DATABASE_URL="<neon-production-url>" npm run seed
```

## Cấu trúc dữ liệu

- `users` — tài khoản (email unique, `password_hash`)
- `calendar_events` — sự kiện (`start_at`/`end_at` timestamptz, `all_day`, `category`, `color`)
- `daily_journals` — nhật ký theo ngày (unique `user_id` + `entry_date`, 14 trường template)

Migrations nằm trong `drizzle/`.
