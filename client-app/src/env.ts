import { runtimeConfig } from "./config/runtimeConfig";

export const ENV = {
  get API_BASE_URL() {
    return runtimeConfig.API_BASE;
  },
};
