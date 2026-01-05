
export interface TareConfig {
  bagsRatio: number;
  deductionKg: number;
}

export interface WeightItem {
  id: string;
  value: number;
  timestamp: number;
}

export interface FarmerTicket {
  id: string;
  name: string;
  price: number;
  tareConfig: TareConfig;
  weights: WeightItem[];
  status: 'active' | 'finalized';
  createdAt: number;
}

export interface AppSettings {
  defaultTare: TareConfig;
  isVoiceEnabled: boolean;
}

export interface AppState {
  tickets: FarmerTicket[];
  settings: AppSettings;
}
