import {
  DeviceBase,
  HomeAssistantMatterEntity,
  logger,
  MatterConnector,
  MatterRegistry,
} from '@home-assistant-matter-hub/core';
import type { MatterDevice } from '@home-assistant-matter-hub/core';
import type { DeviceTypeDefinition } from '@project-chip/matter.js/device';
import { Matterbridge, MatterbridgeDevice, MatterbridgeDynamicPlatform, PlatformConfig } from 'matterbridge';
import type { AnsiLogger } from 'matterbridge/logger';
import { createHash } from 'node:crypto';

import { parseConfiguration } from './parse-configuration.js';

export class HomeAssistantPlatform extends MatterbridgeDynamicPlatform implements MatterRegistry {
  private logger = logger.child({ service: 'HomeAssistantPlatform' });
  private connector!: MatterConnector;

  constructor(matterbridge: Matterbridge, log: AnsiLogger, platformConfig: PlatformConfig) {
    super(matterbridge, log, platformConfig);
    log.logName = 'HomeAssistantPlatform';
  }

  private createDevice(
    vendorName: string,
  ): (entity: HomeAssistantMatterEntity, definition: DeviceTypeDefinition) => MatterDevice {
    return (entity, definition) => {
      const device = new MatterbridgeDevice(definition);

      const productName = definition.name;
      entity.matter.serialNumber = createHash('md5').update(entity.entity_id).digest('hex').substring(0, 30);
      entity.matter.uniqueId = createHash('md5')
        .update(entity.matter.deviceName + entity.matter.serialNumber + vendorName + productName)
        .digest('hex');

      device.log.logName = entity.entity_id;
      device.uniqueId = entity.matter.uniqueId;
      device.serialNumber = entity.matter.serialNumber;
      device.deviceName = entity.matter.deviceName;
      return Object.assign(device, {
        async executeCommandHandler(action: string, ...args: unknown[]): Promise<void> {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await device._executeHandler(action as any, ...args);
        },
      });
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

  async register(device: DeviceBase): Promise<void> {
    await this.registerDevice(device.matter as unknown as MatterbridgeDevice);
  }

  async unregister(device: DeviceBase): Promise<void> {
    await this.unregisterDevice(device.matter as unknown as MatterbridgeDevice);
  }
}
