/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STAFF_API_BASE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CLIENT_APP_SHARED_TOKEN: string;
  readonly VITE_GA_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}