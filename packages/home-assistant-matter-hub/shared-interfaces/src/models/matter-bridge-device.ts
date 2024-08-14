export interface MatterFabric {
  id: string;
  name: string;
  activeSessions: number;
}

export interface MatterBridgeDevice {
  id: string;
  name: string;
  qrPairingCode?: string;
  manualPairingCode?: string;
  fabrics?: MatterFabric[];
}
