import express from 'express';
import expressWs from 'express-ws';

import { DevicesApi } from './rest/devices.js';

import { DeviceRegistry } from '../matter/device-registry.js';

export function createWebServer(registry: DeviceRegistry): expressWs.Instance {
  const instance = expressWs(express());
  instance.app.use(restApi(registry));
  instance.app.use(websocket());
  return instance;
}

function restApi(registry: DeviceRegistry): express.Router {
  const router = express.Router();
  router.use('/devices', new DevicesApi(registry).router);
  return router;
}

function websocket(): express.Router {
  return express.Router();
}
