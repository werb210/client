import { getRuntimeConfig } from "./config/runtimeConfig";

export const ENV = {
  get API_BASE_URL() {
    return getRuntimeConfig().API_BASE_URL;
  },
};
