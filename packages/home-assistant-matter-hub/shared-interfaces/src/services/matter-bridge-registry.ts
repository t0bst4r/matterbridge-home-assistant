import { MatterBridgeDevice } from '../models/index.js';

export interface MatterBridgeRegistry {
  get bridges(): MatterBridgeDevice[];
}
