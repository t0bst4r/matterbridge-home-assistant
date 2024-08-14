import {
  MatterBridgeDevice,
  MatterDevice,
  MatterDeviceRegistry,
  MatterEndpointDevice,
} from '@home-assistant-matter-hub/shared-interfaces';
import { CommissioningServer } from '@project-chip/matter.js';
import { EndpointNumber } from '@project-chip/matter.js/datatype';
import { Aggregator, DeviceTypes } from '@project-chip/matter.js/device';

export class BridgeServer implements MatterDeviceRegistry {
  readonly devices: MatterDevice[] = [];
  readonly commissioningServer: CommissioningServer;
  private readonly aggregator: Aggregator;

  constructor(public readonly meta: MatterBridgeDevice) {
    this.commissioningServer = new CommissioningServer({
      nextEndpointId: 10000,
      deviceName: `${meta.name} (${meta.id})`,
      deviceType: DeviceTypes.AGGREGATOR.code,
      basicInformation: {
        nodeLabel: `${meta.name} (${meta.id})`,
        vendorId: 0xfff1,
        vendorName: 't0bst4r',
        productId: 0x8000,
        productName: 'Home-Assistant-Matter-Hub',
      },
    });
    this.aggregator = new Aggregator([], {
      uniqueStorageKey: meta.id,
      endpointId: EndpointNumber(1),
    });
    this.commissioningServer.addDevice(this.aggregator);
  }

  async register(device: MatterEndpointDevice): Promise<void> {
    this.aggregator.addBridgedDevice(device.endpoint);
  }

  async unregister(device: MatterEndpointDevice): Promise<void> {
    this.aggregator.removeBridgedDevice(device.endpoint);
  }
}
