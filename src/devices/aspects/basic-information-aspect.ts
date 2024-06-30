import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { BasicInformation, ClusterServer } from '@project-chip/matter.js/cluster';
import { VendorId } from '@project-chip/matter.js/datatype';
import crypto from 'crypto';
import { HomeAssistantDevice } from '../home-assistant-device.js';

export class BasicInformationAspect extends MatterAspect<Entity> {
  async update(): Promise<void> {}

  constructor(device: HomeAssistantDevice, entity: Entity) {
    super(`${entity.entity_id}/BasicInformation`);
    device.addClusterServer(
      this.create(
        0x0000,
        't0bst4r',
        0x8000,
        entity.entity_id.split('.').at(0),
        entity.attributes.friendly_name ?? entity.entity_id,
        this.createUniqueId(entity.entity_id),
        1,
        1,
      ),
    );
  }

  private create(
    vendorId: number,
    vendorName: string,
    productId: number,
    productName: string,
    deviceName: string,
    serialNumber: string,
    softwareVersion: number,
    hardwareVersion: number,
  ) {
    return ClusterServer(
      BasicInformation.ClusterInstance,
      {
        uniqueId: this.createUniqueId(deviceName, serialNumber, vendorName, productName),
        serialNumber,
        reachable: true,
        productId,
        productName: productName.slice(0, 32),
        productLabel: deviceName.slice(0, 64),
        vendorName: vendorName.slice(0, 32),
        vendorId: VendorId(vendorId),
        location: 'not specified',
        nodeLabel: deviceName.slice(0, 32),
        dataModelRevision: 1,
        softwareVersion,
        softwareVersionString: softwareVersion.toString(),
        hardwareVersion,
        hardwareVersionString: hardwareVersion.toString(),
        capabilityMinima: { caseSessionsPerFabric: 3, subscriptionsPerFabric: 3 },
      },
      {},
      {
        startUp: true,
        shutDown: true,
        leave: true,
        reachableChanged: true,
      },
    );
  }

  private createUniqueId(...args: string[]): string {
    return args
      .reduce((hash, value) => hash.update(value), crypto.createHash('md5'))
      .digest('hex')
      .substring(0, 30);
  }
}
