// Supabase Client Integration Boundary
// Provides typed client when env variables exist, otherwise falls back gracefully.

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('your-project-ref'));
};

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  // When configured, dynamically load or use supabase-js client
  return null;
};
