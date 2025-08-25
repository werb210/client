// React Beautiful DnD on demand (already installed)
export async function useReactBeautifulDnD() {
  const mod = await import("react-beautiful-dnd");
  return mod;
}

// Date manipulation on demand (already installed)
export async function useDateFns() {
  const mod = await import("date-fns");
  return mod;
}

// UUID generation on demand (already installed)
export async function useUuid() {
  const mod = await import("uuid");
  return mod;
}

// HTML2Canvas on demand (already installed)
export async function useHtml2Canvas() {
  const mod = await import("html2canvas");
  return mod.default;
}

// Note: Lodash utilities are avoided in favor of native JS methods for better tree-shaking

// OpenAI on demand (already installed)
export async function useOpenAI() {
  const mod = await import("openai");
  return mod;
}

// Wouter router on demand
export async function useWouter() {
  const mod = await import("wouter");
  return mod;
}