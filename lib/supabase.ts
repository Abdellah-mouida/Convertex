import { createClient } from "@supabase/supabase-js";

// Server-side usage with full privileges
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
