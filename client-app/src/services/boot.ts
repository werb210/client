import { ClientProfileStore } from "../state/clientProfiles";
import { OfflineStore } from "../state/offline";

export type BootRoute = "/portal" | "/resume" | "/apply/step-1";

export type BootContext = {
  hasSubmittedProfile: boolean;
  hasCachedApplication: boolean;
};

export function resolveBootRoute(context: BootContext): BootRoute {
  if (context.hasSubmittedProfile) return "/portal";
  if (context.hasCachedApplication) return "/resume";
  return "/apply/step-1";
}

export function getBootRoute(): BootRoute {
  const cached = OfflineStore.load();
  return resolveBootRoute({
    hasSubmittedProfile: ClientProfileStore.hasSubmittedProfile(),
    hasCachedApplication: Boolean(cached?.applicationToken),
  });
}
