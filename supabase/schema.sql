-- ============================================
-- Halume Parfum E-Commerce Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================
-- PRODUCTS TABLE
-- ============================================
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric(12, 0) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  category text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table products enable row level security;

-- Anyone can view products
create policy "Anyone can view products"
  on products for select using (true);

-- Only admins can modify products
create policy "Admins can insert products"
  on products for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update products"
  on products for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete products"
  on products for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute procedure update_updated_at();

-- ============================================
-- ORDERS TABLE
-- ============================================
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total numeric(12, 0) not null check (total >= 0),
  shipping_address text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table orders enable row level security;

create policy "Users can view own orders"
  on orders for select using (auth.uid() = user_id);

create policy "Users can create orders"
  on orders for insert with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on orders for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update orders"
  on orders for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create trigger orders_updated_at
  before update on orders
  for each row execute procedure update_updated_at();

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders on delete cascade,
  product_id uuid references products on delete set null,
  quantity integer not null check (quantity > 0),
  price numeric(12, 0) not null check (price >= 0),
  created_at timestamptz default now()
);

alter table order_items enable row level security;

create policy "Users can view own order items"
  on order_items for select using (
    exists (select 1 from orders where id = order_id and user_id = auth.uid())
  );

create policy "Users can create order items"
  on order_items for insert with check (
    exists (select 1 from orders where id = order_id and user_id = auth.uid())
  );

create policy "Admins can view all order items"
  on order_items for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
insert into products (name, description, price, stock, category, image_url) values
  ('Halume Marco Élixir', 'Aroma mewah dengan sentuhan kayu cedar dan musim gugur.', 485000, 120, 'Limited Edition', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400'),
  ('Halume DikLoverz Noiré', 'Parfum gelap dan sensual dengan nuansa oud dan vanila.', 520000, 95, 'Signature Series', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400'),
  ('Halume Rafael D''Or', 'Emas cair dalam sebuah botol – floral dengan musk hangat.', 610000, 60, 'Limited Edition', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400'),
  ('Halume Yazid Imperial', 'Kerajaan dalam tiap semprotan, bergamot dan amber.', 575000, 80, 'Imperial Line', 'https://images.unsplash.com/photo-1600612253971-57017a1f62e1?w=400'),
  ('Halume Davien Essence', 'Segar citrus berpadu sandalwood, cocok untuk siang hari.', 430000, 150, 'Signature Series', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400'),
  ('Halume Bobby Royale', 'Klasik dan elegan, aroma kulit dan teh hitam.', 390000, 200, 'Basics', 'https://images.unsplash.com/photo-1547887538-047f6a71eba0?w=400'),
  ('Halume Thufail Al Qamar', 'Bulan malam dengan wewangian bintang melati dan kasturi.', 640000, 45, 'Limited Edition', 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400'),
  ('Halume Faris Noctavire', 'Malam abadi, oud smoky dengan sentuhan rose.', 590000, 70, 'Nuit Collection', 'https://images.unsplash.com/photo-1596995804697-27d11d43652e?w=400'),
  ('Halume Dhimas Arcanthé', 'Aromatik herbaceous bertemu kayu manis eksotis.', 465000, 110, 'Signature Series', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400'),
  ('Halume Axelle Jin Lian Édition Impériale', 'Edisi istimewa dengan keharuman bunga teratai dan gold.', 780000, 30, 'Limited Edition', 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=400'),
  ('Halume Danar Ardent Royale', 'Berani dan hangat, dengan patchouli dan lada hitam.', 545000, 85, 'Imperial Line', 'https://images.unsplash.com/photo-1590156562745-5d4a4a8a1c1b?w=400'),
  ('Halume Fahmi Celestique', 'Aroma langit pagi, aquatic bersih dan ringan.', 410000, 180, 'Basics', 'https://images.unsplash.com/photo-1629134151916-0a3c7e0cd9e0?w=400'),
  ('Halume Satya Ethereal Crown', 'Mahkota tak kasat mata dari iris dan amber putih.', 620000, 55, 'Nuit Collection', 'https://images.unsplash.com/photo-1600612253971-57017a1f62e1?w=400'),
  ('Halume Liang Hao Lumière', 'Cahaya Paris dalam botol, floral powdery yang memesona.', 530000, 90, 'Signature Series', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400'),
  ('Halume Ari Æternox', 'Abadi dan kuat, vetiver dan frankincense sejati.', 680000, 40, 'Imperial Line', 'https://images.unsplash.com/photo-1547887538-047f6a71eba0?w=400');
