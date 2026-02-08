import { create } from 'zustand';

export type AppScreen = 'loading' | 'settings' | 'chat';

export interface GatewayInfo {
  url: string;
  port: number;
  token: string;
}

export type GatewayStatus =
  | { type: 'stopped' }
  | { type: 'starting' }
  | { type: 'running'; info: GatewayInfo }
  | { type: 'error'; message: string };

export type RuntimeStatus =
  | { type: 'checking' }
  | { type: 'downloading'; progress: number }
  | { type: 'installed'; version: string }
  | { type: 'error'; message: string };

interface AppState {
  screen: AppScreen;
  gatewayStatus: GatewayStatus;
  runtimeStatus: RuntimeStatus;
  apiKeyConfigured: boolean;
  error: string | null;

  setScreen: (screen: AppScreen) => void;
  setGatewayStatus: (status: GatewayStatus) => void;
  setRuntimeStatus: (status: RuntimeStatus) => void;
  setApiKeyConfigured: (configured: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: 'loading',
  gatewayStatus: { type: 'stopped' },
  runtimeStatus: { type: 'checking' },
  apiKeyConfigured: false,
  error: null,

  setScreen: (screen) => set({ screen }),
  setGatewayStatus: (gatewayStatus) => set({ gatewayStatus }),
  setRuntimeStatus: (runtimeStatus) => set({ runtimeStatus }),
  setApiKeyConfigured: (apiKeyConfigured) => set({ apiKeyConfigured }),
  setError: (error) => set({ error }),
}));
