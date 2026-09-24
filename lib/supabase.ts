import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const developmentKey = process.env.NODE_ENV !== "production" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;
  const key = secretKey || developmentKey;

  if (!url || !key) {
    return null;
  }

  try {
    new URL(url);
  } catch {
    throw new Error("La URL de Supabase configurada no es válida.");
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

export function isProductionStorageRequired() {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}
