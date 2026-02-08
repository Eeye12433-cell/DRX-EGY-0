

## Fix: Admin Cannot Edit or Delete Products

### Root Cause

All Row Level Security (RLS) policies on the `products` table are set to **RESTRICTIVE** instead of **PERMISSIVE**. In the database, RESTRICTIVE policies can only narrow access but cannot grant it. Since there are no PERMISSIVE policies at all, the result is that **no one** — not even admins — can access any products.

This also explains why the products list shows empty for authenticated admin users (the network request returns `[]`).

### Solution

Drop all existing product policies and recreate them as **PERMISSIVE** policies:

1. **"Products are viewable by everyone"** (SELECT) — allows all users to read products
2. **"Only admins can insert products"** (INSERT) — admin check
3. **"Only admins can update products"** (UPDATE) — admin check
4. **"Only admins can delete products"** (DELETE) — admin check

### Technical Details

A single database migration will:

```sql
-- Drop all existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can read products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Recreate as PERMISSIVE
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update products"
  ON public.products FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete products"
  ON public.products FOR DELETE
  USING (is_admin());
```

No code changes are needed — the AdminPanel already has the correct logic for editing and deleting. The issue is purely at the database policy level.

