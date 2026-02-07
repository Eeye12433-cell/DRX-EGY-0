-- Add service role policy to verify_code_attempts so rate limiting actually works
CREATE POLICY "Service role can manage attempt logs"
ON public.verify_code_attempts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);