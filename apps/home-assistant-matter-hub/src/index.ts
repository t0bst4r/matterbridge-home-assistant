import '@project-chip/matter-node.js';

import { logger } from '@home-assistant-matter-hub/core';
import {
  BridgedDeviceBasicInformationCluster,
  ClusterServer,
  createDefaultGroupsClusterServer,
  createDefaultIdentifyClusterServer,
  createDefaultOnOffClusterServer,
  createDefaultScenesClusterServer,
} from '@project-chip/matter.js/cluster';
import { Device, DeviceTypes } from '@project-chip/matter.js/device';
import { Environment, StorageService } from '@project-chip/matter.js/environment';
import { Logger } from '@project-chip/matter.js/log';

import { MatterLoggerTransport } from './logging/transports.js';
import { MatterServer } from './matter/matter-server.js';

logger.add(new MatterLoggerTransport());
const log = logger.child({ service: 'home-assistant-matter-hub' });

Logger.level = process.env.LOG_LEVEL ?? 'info';

const environment = Environment.default;
const storageService = environment.get(StorageService);
const storageManager = await storageService.open('HomeAssistantMatterHub');

log.info('Starting home-assistant-matter-hub');
log.info('Storage location: %s', storageService.location);

const server = new MatterServer(storageManager);
const bridge = await server.createBridge({
  id: '1',
  name: 'Test Bridge',
});

await bridge.register({
  entityId: 'entity.id',
  friendlyName: 'friendly-name',
  domain: 'entity',
  deviceType: DeviceTypes.ON_OFF_PLUGIN_UNIT.name,
  currentState: {},
  endpoint: ((): Device => {
    const device = new Device(DeviceTypes.ON_OFF_PLUGIN_UNIT);
    device.addClusterServer(createDefaultIdentifyClusterServer({ identify: () => console.log('identify') }));
    device.addClusterServer(createDefaultGroupsClusterServer());
    device.addClusterServer(createDefaultScenesClusterServer());
    device.addClusterServer(createDefaultOnOffClusterServer());
    device.addClusterServer(
      ClusterServer(
        BridgedDeviceBasicInformationCluster,
        {
          reachable: true,
          nodeLabel: 'Test',
        },
        {},
        { reachableChanged: true },
      ),
    );
    return device;
  })(),
});

await server.start();
