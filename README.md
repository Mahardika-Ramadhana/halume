# Halume — Parfum E-Commerce

Full-stack e-commerce web app untuk penjualan parfum, dibangun dengan Next.js App Router dan Supabase.

## Tech Stack

- **Next.js 16** (App Router, Server Components)
- **React 19**
- **TypeScript**
- **Supabase** — Auth + PostgreSQL + Row Level Security
- **Tailwind CSS v4** + **shadcn/ui**
- **Zustand** — cart state management
- **Sonner** — toast notifications

## Fitur

### Customer
- Autentikasi (Register & Login) via Supabase Auth
- Katalog produk dengan pencarian dan filter kategori
- Halaman detail produk
- Keranjang belanja (persisted dengan Zustand)
- Checkout dengan form informasi pengiriman
- Riwayat pesanan

### Admin
- Dashboard statistik
- Manajemen produk: tambah, edit, hapus (CRUD)
- Manajemen pesanan: lihat dan update status
- Role-based access control (customer / admin)

## Struktur Halaman

```
/               → Katalog produk
/products/[id]  → Detail produk
/cart           → Keranjang belanja
/checkout       → Form checkout
/orders         → Riwayat pesanan
/login          → Login
/register       → Register
/admin          → Dashboard admin
/admin/products → Manajemen produk
/admin/orders   → Manajemen pesanan
```

## Cara Menjalankan

### 1. Clone & Install

```bash
git clone https://github.com/username/halume.git
cd halume
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan isi file `supabase/schema.sql`
3. File ini akan membuat semua tabel beserta sample data produk

### 3. Konfigurasi Environment

```bash
cp .env.local.example .env.local
```

Isi `.env.local` dengan kredensial dari **Supabase → Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 5. Setup Akun Admin

1. Register akun baru melalui `/register`
2. Jalankan query berikut di Supabase SQL Editor:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'email-kamu@example.com';
```

3. Login kembali → menu "Admin" akan muncul di navbar

## Deploy

Deploy ke Vercel dengan satu perintah:

```bash
npx vercel
```

Tambahkan environment variables (`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`) di dashboard Vercel.
