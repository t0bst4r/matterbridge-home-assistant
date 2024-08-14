import { MatterBridgeDevice, MatterBridgeRegistry } from '@home-assistant-matter-hub/shared-interfaces';
import { Request, Response, Router } from 'express';

export function bridgesApi(registry: MatterBridgeRegistry): Router {
  const router = Router();
  router.get('/', async (_: Request, res: Response) => getAllBridges(registry, res));
  return router;
}

function getAllBridges(registry: MatterBridgeRegistry, res: Response) {
  const bridges = registry.bridges.map<MatterBridgeDevice>((bridge) => ({
    id: bridge.id,
    name: bridge.name,
    manualPairingCode: bridge.manualPairingCode,
    qrPairingCode: bridge.qrPairingCode,
    fabrics: bridge.fabrics?.map((fabric) => ({
      id: fabric.id,
      name: fabric.name,
      activeSessions: fabric.activeSessions,
    })),
  }));
  res.status(200).contentType('application/json').send(JSON.stringify(bridges));
}
