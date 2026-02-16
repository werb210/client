/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly MODE: string;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer?: Array<Record<string, unknown>>;
  __APP_CONTINUATION__?: {
    applicationId: string;
    step: number;
    data: Record<string, unknown>;
  };
  __APP_CONTINUATION_ERROR__?: string;
}
