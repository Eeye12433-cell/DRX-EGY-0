
-- Drop existing RESTRICTIVE policies on products
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

-- Recreate as PERMISSIVE policies
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

-- Fix orders policies too
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Anonymous can create guest orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (is_admin());

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Anonymous can create guest orders"
ON public.orders FOR INSERT
WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Users can update their own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id);

-- Fix order_items policies
DROP POLICY IF EXISTS "Can create order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Can view order items for accessible orders" ON public.order_items;

CREATE POLICY "Can view order items for accessible orders"
ON public.order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id));

CREATE POLICY "Can create order items for own orders"
ON public.order_items FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)));

-- Fix reviews policies
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

-- Fix verification_codes policies  
DROP POLICY IF EXISTS "Admins can delete verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Admins can insert verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Admins can select verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Admins can update verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Service role full access to verification codes" ON public.verification_codes;

CREATE POLICY "Admins can select verification codes"
ON public.verification_codes FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert verification codes"
ON public.verification_codes FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update verification codes"
ON public.verification_codes FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete verification codes"
ON public.verification_codes FOR DELETE
USING (is_admin());

CREATE POLICY "Service role full access to verification codes"
ON public.verification_codes FOR ALL
USING (true)
WITH CHECK (true);

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);
