
-- Create rate limiting table for verify-code endpoint
CREATE TABLE public.verify_code_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  attempted_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS (service role will bypass it anyway in edge functions)
ALTER TABLE public.verify_code_attempts ENABLE ROW LEVEL SECURITY;

-- No public access policies needed - only accessed via service role in edge function

-- Create index for efficient lookups
CREATE INDEX idx_verify_code_attempts_ip_time ON public.verify_code_attempts (ip_address, attempted_at);

-- Create cleanup function to remove old attempts (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_verify_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.verify_code_attempts WHERE attempted_at < now() - interval '1 hour';
$$;
