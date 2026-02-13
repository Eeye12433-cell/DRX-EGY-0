-- Delete all products to reset the catalog
-- This will also delete reviews (CASCADE) and set order_items.product_id to NULL (SET NULL)

TRUNCATE TABLE public.products CASCADE;
