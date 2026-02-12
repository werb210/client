import { ENV } from "@/config/env";

export function checkEnv() {
  void ENV.API_BASE_URL;
  void ENV.APP_ENV;
}
