const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!apiBaseUrl) {
  throw new Error(
    "環境変数 VITE_API_BASE_URL が設定されていません。",
  );
}

if (!supabaseUrl) {
  throw new Error(
    "環境変数 VITE_SUPABASE_URL が設定されていません。",
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "環境変数 VITE_SUPABASE_ANON_KEY が設定されていません。",
  );
}

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ""),
  supabaseUrl,
  supabaseAnonKey,
} as const;