import '@project-chip/matter-node.js';

import { CommissioningServer, MatterServer } from '@project-chip/matter.js';
import {
  BridgedDeviceBasicInformationCluster,
  ClusterServer,
  createDefaultGroupsClusterServer,
  createDefaultIdentifyClusterServer,
  createDefaultOnOffClusterServer,
  createDefaultScenesClusterServer,
} from '@project-chip/matter.js/cluster';
import { EndpointNumber } from '@project-chip/matter.js/datatype';
import { Aggregator, Device, DeviceTypes } from '@project-chip/matter.js/device';
import { Environment, StorageService } from '@project-chip/matter.js/environment';
import { QrCodeSchema } from '@project-chip/matter.js/schema';

const environment = Environment.default;
const storageService = environment.get(StorageService);
const storageManager = await storageService.open('HomeAssistantMatterHub');

const server = new MatterServer(storageManager, {});

const commissioningServer = new CommissioningServer({
  nextEndpointId: 1000,
  deviceName: 'My Simple Device',
  deviceType: DeviceTypes.AGGREGATOR.code,
  basicInformation: {
    nodeLabel: 'My Simple Device',
    vendorId: 0xfff1,
    vendorName: 't0bst4r',
    productId: 0x8001,
    productName: 'Simple Test',
  },
});

const aggregator = new Aggregator([], {
  endpointId: EndpointNumber(1),
});

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

await server.addCommissioningServer(commissioningServer);
commissioningServer.addDevice(aggregator);
aggregator.addBridgedDevice(device);

await server.start();

if (commissioningServer.isCommissioned()) {
  console.log('Server is commissioned');
} else {
  const { qrPairingCode, manualPairingCode } = commissioningServer.getPairingCode();
  const qrCode = new QrCodeSchema().encode(qrPairingCode);
  console.info(
    [
      `Started on port ${commissioningServer.getPort()}`,
      `Manual Pairing code: ${manualPairingCode}`,
      `Pairing code: ${qrPairingCode}`,
      qrCode,
    ].join('\n'),
  );

  process.on('SIGINT', async () => {
    await server.close();
  });
}
