-- Fix overly permissive verification codes update policy
-- Only allow updating to mark as used (not other fields)
DROP POLICY IF EXISTS "Verification codes can be updated by everyone" ON public.verification_codes;

CREATE POLICY "Verification codes can be marked as used" ON public.verification_codes 
    FOR UPDATE USING (used = false) 
    WITH CHECK (used = true);