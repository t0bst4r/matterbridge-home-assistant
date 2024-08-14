import { MatterBridgeDevice } from '@home-assistant-matter-hub/shared-interfaces';

import { Storage } from './storage.js';

export interface StorageV1 extends Storage {
  version: 'v1';
  bridges?: MatterBridgeDevice[];
}
