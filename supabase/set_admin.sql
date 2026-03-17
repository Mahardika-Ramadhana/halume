-- Jadikan user sebagai admin
-- Ganti 'email@kamu.com' dengan email yang ingin dijadikan admin

UPDATE profiles
SET role = 'admin'
WHERE email = 'email@kamu.com';
