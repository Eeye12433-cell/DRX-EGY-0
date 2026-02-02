-- Fix overly permissive orders RLS policy
-- Drop the public access policy that exposes all orders
DROP POLICY IF EXISTS "Anyone can view orders by tracking number" ON public.orders;

-- Add policy for admins to view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (is_admin());

-- Add policy for admins to update any order
CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Add policy for admins to manage verification codes
DROP POLICY IF EXISTS "Service role can manage verification codes" ON public.verification_codes;

CREATE POLICY "Admins can select verification codes"
ON public.verification_codes FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can insert verification codes"
ON public.verification_codes FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins can update verification codes"
ON public.verification_codes FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete verification codes"
ON public.verification_codes FOR DELETE
TO authenticated
USING (is_admin());

-- Keep service role access for edge functions
CREATE POLICY "Service role full access to verification codes"
ON public.verification_codes FOR ALL
TO service_role
USING (true)
WITH CHECK (true);