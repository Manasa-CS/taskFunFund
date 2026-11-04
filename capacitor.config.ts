import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskfunfund.app',
  appName: 'TaskFunFund',
  webDir: 'dist',
  backgroundColor: '#fffbeb',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#fffbeb',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    LocalNotifications: {
      iconColor: '#ffd43b',
    },
  },
};

export default config;
