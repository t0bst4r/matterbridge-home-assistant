import { MatterDevice, MatterDeviceRegistry } from '@home-assistant-matter-hub/shared-interfaces';
import { Response, Router } from 'express';

export function devicesApi(registry: MatterDeviceRegistry): Router {
  const router = Router();
  router.get('/', async (_, res) => getAllDevices(registry, res));
  return router;
}

function getAllDevices(registry: MatterDeviceRegistry, res: Response) {
  const devices = registry.devices.map<MatterDevice>((device) => ({
    domain: device.domain,
    entityId: device.entityId,
    friendlyName: device.friendlyName,
    deviceType: device.deviceType,
    currentState: device.currentState,
  }));
  res.status(200).contentType('application/json').send(JSON.stringify(devices));
}
