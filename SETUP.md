# ShopNext - Setup Guide

## Tech Stack
- **Next.js 14** (App Router)
- **Supabase** (Auth + PostgreSQL)
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (cart state)

## Fitur
- Auth: Login & Register
- Katalog produk dengan filter kategori & search
- Halaman detail produk
- Keranjang belanja (persisted)
- Checkout dengan alamat pengiriman
- Riwayat pesanan user
- Admin Dashboard: statistik
- Admin Products: CRUD produk
- Admin Orders: update status pesanan

---

## 1. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** di dashboard Supabase
3. Copy-paste isi file `supabase/schema.sql` dan jalankan
4. Ini akan membuat semua tabel + sample data produk

## 2. Konfigurasi Environment

Copy `.env.local.example` menjadi `.env.local` dan isi dengan nilai dari Supabase:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

Temukan nilai ini di Supabase: **Settings → API**

## 3. Jalankan Aplikasi

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 4. Setup Admin

1. Register akun baru melalui halaman `/register`
2. Di Supabase SQL Editor, jalankan:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'email-kamu@example.com';
```

3. Login kembali → tombol "Admin" akan muncul di navbar

## 5. Deploy ke Vercel

```bash
npx vercel
```

Tambahkan environment variables di Vercel dashboard.
