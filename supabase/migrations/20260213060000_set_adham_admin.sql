-- Grant Admin role to user admin-adham@drx-egypt.com
-- User ID: 70c5838e-6f2a-428e-bf79-53bea07f8f35

INSERT INTO public.user_roles (user_id, role)
VALUES ('70c5838e-6f2a-428e-bf79-53bea07f8f35', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also ensure a profile entry exists for better UI compatibility
INSERT INTO public.profiles (user_id, email, full_name)
VALUES ('70c5838e-6f2a-428e-bf79-53bea07f8f35', 'admin-adham@drx-egypt.com', 'Adham Admin')
ON CONFLICT (user_id) DO UPDATE 
SET email = EXCLUDED.email;
