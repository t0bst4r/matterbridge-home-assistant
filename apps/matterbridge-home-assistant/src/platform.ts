import { DeviceBase, HomeAssistantMatterEntity, logger, MatterConnector } from '@home-assistant-matter-hub/core';
import { MatterDevice, MatterDeviceRegistry, MatterEndpointDevice } from '@home-assistant-matter-hub/shared-interfaces';
import type { Device, DeviceTypeDefinition } from '@project-chip/matter.js/device';
import { Matterbridge, MatterbridgeDevice, MatterbridgeDynamicPlatform, PlatformConfig } from 'matterbridge';
import type { AnsiLogger } from 'matterbridge/logger';
import { createHash } from 'node:crypto';

import { parseConfiguration } from './parse-configuration.js';

export class HomeAssistantPlatform extends MatterbridgeDynamicPlatform implements MatterDeviceRegistry {
  private logger = logger.child({ service: 'HomeAssistantPlatform' });
  private connector!: MatterConnector;

  public readonly devices: MatterDevice[] = [];

  constructor(matterbridge: Matterbridge, log: AnsiLogger, platformConfig: PlatformConfig) {
    super(matterbridge, log, platformConfig);
    log.logName = 'HomeAssistantPlatform';
  }

  private createDevice(
    vendorName: string,
  ): (entity: HomeAssistantMatterEntity, definition: DeviceTypeDefinition) => Device {
    return (entity, definition) => {
      const device = new MatterbridgeDevice(definition);

      const productName = definition.name;
      entity.matter.serialNumber = createHash('md5').update(entity.entity_id).digest('hex').substring(0, 30);
      entity.matter.uniqueId = createHash('md5')
        .update(entity.attributes.friendly_name + entity.matter.serialNumber + vendorName + productName)
        .digest('hex');

      device.log.logName = entity.entity_id;
      device.uniqueId = entity.matter.uniqueId;
      device.serialNumber = entity.matter.serialNumber;
      device.deviceName = entity.attributes.friendly_name;
      return device;
    };
  }

  override async onStart(reason?: string) {
    const connectorConfig = parseConfiguration(this.logger);
    DeviceBase.setDeviceConstructor(this.createDevice(connectorConfig.devices.vendorName));
    this.logger.debug('onStart called with reason: %s', reason ?? 'none');

    this.connector = await MatterConnector.create({
      ...connectorConfig,
      registry: this,
    }).catch((error) => {
      this.logger.error(error);
      throw error;
    });
    this.logger.debug('onStart finished');
  }

  override async onShutdown(reason?: string) {
    this.logger.debug('onShutdown called with reason:', reason ?? 'none');
    this.connector.close();
    if (this.config.unregisterOnShutdown === true) await this.unregisterAllDevices();
  }

  async register(device: MatterEndpointDevice): Promise<void> {
    await this.registerDevice(device.endpoint as MatterbridgeDevice);
    this.devices.push(device);
  }

  async unregister(device: MatterEndpointDevice): Promise<void> {
    await this.unregisterDevice(device.endpoint as MatterbridgeDevice);
    this.devices.splice(this.devices.indexOf(device), 1);
  }
}
