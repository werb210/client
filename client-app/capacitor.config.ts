import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boreal.client',
  appName: 'Boreal Client',
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    scheme: "BorealClient"
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
