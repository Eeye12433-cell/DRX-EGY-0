
-- Fix 1: order_items SELECT policy - require ownership or admin
DROP POLICY IF EXISTS "Can view order items for accessible orders" ON public.order_items;

CREATE POLICY "Users can view their own order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR is_admin())
  )
);

-- Fix 2: Tighten orders SELECT for guest orders - remove ability for anon to view guest orders
-- Current policies allow owner or admin. Guest orders (user_id IS NULL) are not viewable by anyone except admins.
-- This is already correct since auth.uid() = NULL is always false. No change needed for orders SELECT.

-- Fix 3: profiles - already restricted to owner only. The supabase_lov concern about service roles is not
-- something RLS can address (service role bypasses RLS by design). Current policies are correct.
-- No migration needed.
