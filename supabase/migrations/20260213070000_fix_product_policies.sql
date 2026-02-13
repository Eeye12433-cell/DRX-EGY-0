-- Consolidation of Products Table Policies
-- Ensure Admins have full control and Public can strictly view

-- 1. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Drop all old policies to prevent conflicts
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

-- 3. Create Clean PERMISSIVE Policies
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.is_admin());

-- 4. Set search_path for the triggers too if needed
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
