import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.da47a9e7109d47c7a9f4b92d031d2f64',
  appName: 'Bits',
  webDir: 'dist',
  server: {
    url: 'https://da47a9e7-109d-47c7-a9f4-b92d031d2f64.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
