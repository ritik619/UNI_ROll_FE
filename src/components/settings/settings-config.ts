import { CONFIG } from 'src/global-config';
import { themeConfig } from 'src/theme/theme-config';

import type { SettingsState } from './types';

// ----------------------------------------------------------------------

export const SETTINGS_STORAGE_KEY: string = 'app-settings';

export const defaultSettings: SettingsState = {
  colorScheme: themeConfig.defaultMode,
  direction: themeConfig.direction,
  contrast: 'default',
  navLayout: 'vertical',
  primaryColor: 'preset1',
  navColor: 'integrate',
  compactLayout: false,
  fontSize: 16,
  fontFamily: themeConfig.fontFamily.secondary,
  version: CONFIG.appVersion,
};
