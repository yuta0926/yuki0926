const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "環境変数 VITE_API_BASE_URL が設定されていません。",
  );
}

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ""),
} as const;