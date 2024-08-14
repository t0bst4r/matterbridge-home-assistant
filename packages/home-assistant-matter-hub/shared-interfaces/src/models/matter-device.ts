export interface MatterDevice {
  domain: string;
  entityId: string;
  friendlyName: string;
  deviceType: string;
  currentState: Record<string, object>;
}
