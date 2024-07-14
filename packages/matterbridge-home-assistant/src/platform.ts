import { DeviceBase, logger, MatterConnector, MatterConnectorConfig, MatterRegistry } from 'home-assistant-matter-hub';
import { Matterbridge, MatterbridgeDynamicPlatform, PlatformConfig } from 'matterbridge';
import type { AnsiLogger } from 'matterbridge/logger';

export interface HomeAssistantPlatformConfig extends PlatformConfig {
  connector: Omit<MatterConnectorConfig, 'registry'>;
}

export class HomeAssistantPlatform extends MatterbridgeDynamicPlatform implements MatterRegistry {
  private logger = logger.child({ service: 'HomeAssistantPlatform' });
  private connector!: MatterConnector;

  constructor(
    matterbridge: Matterbridge,
    log: AnsiLogger,
    private readonly platformConfig: HomeAssistantPlatformConfig,
  ) {
    super(matterbridge, log, platformConfig);
    log.setLogName('HomeAssistantPlatform');
  }

  override async onStart(reason?: string) {
    this.logger.debug('onStart called with reason: %s', reason ?? 'none');

    this.connector = await MatterConnector.create({
      ...this.platformConfig.connector,
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
    await this.registerDevice(device.matter);
  }

  async unregister(device: DeviceBase): Promise<void> {
    await this.unregisterDevice(device.matter);
  }
}
