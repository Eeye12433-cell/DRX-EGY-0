
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can read products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

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
