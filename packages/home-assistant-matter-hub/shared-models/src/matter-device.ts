export interface MatterDeviceBase {
  domain: string;
  entityId: string;
  friendlyName: string;
  registered: boolean;
}

export interface RegisteredMatterDevice extends MatterDeviceBase {
  registered: true;
  deviceType: string;
  currentState: Record<string, object>;
}

export interface UnregisteredMatterDevice extends MatterDeviceBase {
  registered: false;
  comments: string[];
}

export type MatterDevice = RegisteredMatterDevice | UnregisteredMatterDevice;
