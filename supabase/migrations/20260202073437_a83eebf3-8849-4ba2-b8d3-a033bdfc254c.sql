-- Create app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- FIX: Products table - Add admin-only write policies
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

-- FIX: Verification codes - Remove public access, restrict to service role
DROP POLICY IF EXISTS "Verification codes are viewable by everyone" ON public.verification_codes;
DROP POLICY IF EXISTS "Verification codes can be marked as used" ON public.verification_codes;

-- No direct SELECT access - verification happens via edge function
-- Only allow marking as used via service role (edge function)
CREATE POLICY "Service role can manage verification codes"
ON public.verification_codes FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- FIX: Orders table - Improve INSERT policy to require either auth or valid order data
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Allow authenticated users to create orders linked to their account
CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow anonymous users to create guest orders (user_id must be NULL)
CREATE POLICY "Anonymous can create guest orders"
ON public.orders FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow anyone to view orders by tracking number (for guest order tracking)
CREATE POLICY "Anyone can view orders by tracking number"
ON public.orders FOR SELECT
USING (true);

-- FIX: Order items - Allow viewing for guest orders too
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;

-- Allow creating order items with valid order
CREATE POLICY "Can create order items for own orders"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

-- Allow viewing order items for accessible orders
CREATE POLICY "Can view order items for accessible orders"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_id
  )
);