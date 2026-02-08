
-- Fix SECURITY DEFINER view issue - recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_reviews;
CREATE VIEW public.public_reviews WITH (security_invoker = true) AS
SELECT 
  id,
  product_id,
  user_name,
  rating,
  comment,
  created_at
FROM public.reviews;

GRANT SELECT ON public.public_reviews TO anon, authenticated;
