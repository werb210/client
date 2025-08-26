export const flags = {
  enabled: import.meta?.env?.PROD && !!import.meta.env.VITE_LAUNCHDARKLY_KEY
};