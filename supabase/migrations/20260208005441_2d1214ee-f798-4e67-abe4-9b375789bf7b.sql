
-- Create a public view that excludes user_id from reviews
CREATE VIEW public.public_reviews AS
SELECT 
  id,
  product_id,
  user_name,
  rating,
  comment,
  created_at
FROM public.reviews;

-- Grant access to the view
GRANT SELECT ON public.public_reviews TO anon, authenticated;
