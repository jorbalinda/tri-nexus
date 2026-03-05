import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jordan.triraceday',
  appName: 'Tri Race Day',
  webDir: 'out',
  server: {
    url: 'https://triraceday.com',
    cleartext: false,
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'default',
      backgroundColor: '#FBFBFD',
    },
  },
};

export default config;
