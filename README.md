# 🌳 Mind Tree

> Visual thought organizer with inverted tree structure, progress tracking, and live updates.

## ✨ Features

- 🌲 **Inverted tree visualization** — Root ở trên, nhánh mọc xuống
- 📊 **Progress tracking** — % hoàn thành mỗi node, màu gradient tự động
- 📝 **Rich text notes** — Tiptap editor với Markdown support
- 🔗 **Cross-tree links** — Kết nối nodes giữa các tree khác nhau
- ⚡ **Live updates** — Supabase Realtime, không cần refresh
- 🔐 **Admin / Viewer** — Admin toàn quyền, viewer chỉ xem
- ⌘K **Command palette** — Search nhanh mọi tree và node
- 🗺️ **Minimap** — Navigate dễ dàng trong tree lớn

---

## 🚀 Deploy lên Vercel (3 bước)

### Bước 1: Setup Supabase

1. Tạo account tại [supabase.com](https://supabase.com) (free)
2. Tạo project mới
3. Vào **SQL Editor** → paste toàn bộ nội dung file `supabase/schema.sql` → **Run**
4. Vào **Authentication → Email** → bật **Email/Password**
5. Tạo user admin: **Authentication → Users → Add user** (điền email + password)
6. Lấy UUID của user vừa tạo, chạy SQL sau để set admin:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_UUID';
   ```
7. Lấy keys từ **Project Settings → API**:
   - `Project URL`
   - `anon public` key
   - `service_role` key (secret!)

### Bước 2: Push lên GitHub

```bash
cd e:/Lamf/Tree/mind-tree
git init
git add .
git commit -m "Initial commit: Mind Tree app"
git remote add origin https://github.com/YOUR_USERNAME/mind-tree.git
git push -u origin main
```

### Bước 3: Deploy lên Vercel

1. Vào [vercel.com](https://vercel.com) → **New Project** → Import repo vừa tạo
2. Vào **Settings → Environment Variables**, thêm:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL từ Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key từ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key từ Supabase |

3. Click **Deploy** → Done! 🎉

---

## 💻 Chạy local

```bash
# Clone env
cp .env.example .env.local
# Điền các biến trong .env.local

# Cài deps (đã làm rồi)
npm install

# Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

---

## 📖 Hướng dẫn sử dụng

### Admin
1. Truy cập `/login` → đăng nhập bằng tài khoản Supabase
2. Vào **/admin** để tạo và quản lý Trees
3. Click vào Tree → canvas hiện ra
4. Click **+ Root Node** để thêm node gốc
5. Hover node → chọn **+ Child** để thêm node con
6. Click **Edit** để đổi tên + % hoàn thành
7. Click **Note** để mở rich text editor
8. Mọi thay đổi auto-save và live update cho viewers

### Viewer
1. Truy cập URL công khai (Vercel URL)
2. Xem tất cả trees và nodes
3. Click node để xem note
4. Dùng **⌘K** để tìm kiếm nhanh

---

## 🎨 Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database + Auth | Supabase (PostgreSQL + Realtime) |
| Tree visualization | React Flow |
| Note editor | Tiptap |
| State | Zustand |
| Animations | Framer Motion |
| Styling | Tailwind CSS |
| Deploy | Vercel |
