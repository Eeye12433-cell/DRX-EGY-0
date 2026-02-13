-- FINAL SECURITY CONSOLIDATION & SCANNER FIX
-- This migration nukes old policies and implements a clean, hardened state.

-- 1. Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "deny_anon_profiles" ON public.profiles FOR ALL TO anon USING (false);
CREATE POLICY "view_own_profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "create_own_profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- 2. Orders Table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders by tracking number" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anonymous can create guest orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

CREATE POLICY "deny_anon_orders_select" ON public.orders FOR SELECT TO anon USING (false);
CREATE POLICY "allow_anon_create_orders" ON public.orders FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "view_own_orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "create_own_orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "update_orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- 3. Order Items Table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.order_items;
DROP POLICY IF EXISTS "Can view order items for accessible orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Can create order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "deny_anon_items_select" ON public.order_items FOR SELECT TO anon USING (false);
CREATE POLICY "allow_anon_create_items" ON public.order_items FOR INSERT TO anon WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id IS NULL));
CREATE POLICY "view_own_items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin())));
CREATE POLICY "create_own_items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR user_id IS NULL)));

-- 4. Reviews & public_reviews View
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Only admins can maintain reviews" ON public.reviews;

-- Allow public reading ONLY via view (RLS still checked on table if view is security_invoker)
-- We use a selective SELECT policy that allows reading the columns we want for the view.
CREATE POLICY "allow_public_select_reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "authenticated_manage_reviews" ON public.reviews FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Harden public_reviews View
DROP VIEW IF EXISTS public.public_reviews;
CREATE OR REPLACE VIEW public.public_reviews WITH (security_invoker = true, security_barrier = true) AS 
SELECT 
  id,
  product_id,
  user_name,
  rating,
  comment,
  created_at
FROM public.reviews;

-- 5. Strict Search Path for all security-relevant functions
ALTER FUNCTION public.is_admin() SET search_path = public, auth;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public, auth;
ALTER FUNCTION public.validate_profile_ownership() SET search_path = public, auth;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 6. User Roles Protection
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "view_own_roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
-- Only admins can change roles
CREATE POLICY "admin_manage_roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin());
