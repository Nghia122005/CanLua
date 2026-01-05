
import { AppSettings, TareConfig } from './types';

export const DEFAULT_TARE: TareConfig = {
  bagsRatio: 10,
  deductionKg: 1,
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultTare: DEFAULT_TARE,
  isVoiceEnabled: true,
};

export const STORAGE_KEY = 'RICE_WEIGHING_APP_DATA';

export const GROUP_SIZE = 75;
