import { MatterBridgeRegistry, MatterDeviceRegistry } from '@home-assistant-matter-hub/shared-interfaces';
import { Router } from 'express';

import { bridgesApi } from './api/bridges.js';
import { devicesApi } from './api/devices.js';

export function createWebApi(bridgeRegistry: MatterBridgeRegistry, deviceRegistry: MatterDeviceRegistry): Router {
  const router = Router();
  router.use('/devices', devicesApi(deviceRegistry));
  router.use('/bridges', bridgesApi(bridgeRegistry));
  return router;
}
