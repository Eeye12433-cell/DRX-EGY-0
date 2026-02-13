-- Security enhancements for profiles table

-- 1. Create a function to validate profile data against auth.jwt()
CREATE OR REPLACE FUNCTION public.validate_profile_ownership()
RETURNS TRIGGER AS $$
DECLARE
    is_admin boolean;
BEGIN
    -- Check if user is admin or service_role to allow overrides
    is_admin := (auth.jwt() ->> 'role' = 'service_role') OR (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

    -- Ensure user_id cannot be changed during UPDATE
    IF TG_OP = 'UPDATE' AND NEW.user_id <> OLD.user_id THEN
        RAISE EXCEPTION 'Changing user_id is not allowed';
    END IF;

    -- Ensure user_id matches auth.uid() for non-admins
    IF NOT is_admin AND NEW.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'User ID does not match authenticated user';
    END IF;

    -- Ensure Profile Email matches Account Email for security
    -- This prevents spoofing other users' contact info
    IF NOT is_admin AND NEW.email IS NOT NULL AND (auth.jwt() ->> 'email') IS NOT NULL THEN
        IF NEW.email <> (auth.jwt() ->> 'email') THEN
             RAISE EXCEPTION 'Profile email must match account email';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS validate_profile_ownership_trigger ON public.profiles;
CREATE TRIGGER validate_profile_ownership_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_ownership();
