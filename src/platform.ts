import { HassEntities, HassEntity } from 'home-assistant-js-websocket';
import { Matterbridge, MatterbridgeDynamicPlatform, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';
import { HomeAssistantDevice } from './devices/home-assistant-device.js';
import { LightDevice } from './devices/light-device.js';
import { SwitchDevice } from './devices/switch-device.js';
import { HomeAssistantClient, HomeAssistantClientConfig } from './home-assistant/home-assistant-client.js';
import { lightMocks } from './mocks/light-mocks.js';

export interface HomeAssistantPlatformConfig extends PlatformConfig {
  homeAssistantUrl: string;
  homeAssistantAccessToken: string;
  homeAssistantClientConfig?: HomeAssistantClientConfig;
  enableMockDevices?: boolean;
}

export class HomeAssistantPlatform extends MatterbridgeDynamicPlatform {
  private client!: HomeAssistantClient;
  private unsupportedEntities = new Set<string>();
  private devices = new Map<string, HomeAssistantDevice>();

  private deviceFactories: Record<string, (entity: HassEntity) => HomeAssistantDevice> = {
    light: (entity) => new LightDevice(this.client, entity),
    switch: (entity) => new SwitchDevice(this.client, entity),
    media_player: (entity) => new SwitchDevice(this.client, entity),
    scene: (entity) => new SwitchDevice(this.client, entity),
    script: (entity) => new SwitchDevice(this.client, entity),
    automation: (entity) => new SwitchDevice(this.client, entity),
  };

  constructor(
    matterbridge: Matterbridge,
    log: AnsiLogger,
    private readonly platformConfig: HomeAssistantPlatformConfig,
  ) {
    super(matterbridge, log, platformConfig);
    log.setLogName('HomeAssistantPlatform');
  }

  override async onStart(reason?: string) {
    this.validateConfig();
    this.log.info('onStart called with reason:', reason ?? 'none');
    this.client = await HomeAssistantClient.create(
      this.platformConfig.homeAssistantUrl,
      this.platformConfig.homeAssistantAccessToken,
      this.platformConfig.homeAssistantClientConfig,
    );
    this.client.subscribe(this.updateEntities.bind(this));

    if (this.platformConfig.enableMockDevices) {
      const mocks: HassEntity[] = [
        lightMocks.withBrightness(1),
        lightMocks.withHsl(2),
        lightMocks.withRgb(3),
        lightMocks.withXY(4),
        lightMocks.withTemperature(5),
      ];
      await this.updateEntities(Object.fromEntries(mocks.map((e) => [e.entity_id, e])));
    }
  }

  private async updateEntities(entities: HassEntities): Promise<void> {
    const supportedEntities = Object.entries(entities)
      .filter(([key]) => !this.unsupportedEntities.has(key))
      .map(([, entity]) => entity);
    for (const entity of supportedEntities) {
      await this.updateEntity(entity);
    }
  }

  private async updateEntity(entity: HassEntity): Promise<void> {
    let device = this.devices.get(entity.entity_id);
    if (!device) {
      const domain = entity.entity_id.split('.')[0];
      if (this.deviceFactories[domain]) {
        device = this.deviceFactories[domain](entity);
        try {
          await this.registerDevice(device);
          this.devices.set(entity.entity_id, device);
        } catch (e: unknown) {
          this.log.warn(`Failed to register device: ${entity.entity_id}`);
          this.log.error((e as object).toString());
          this.unsupportedEntities.add(entity.entity_id);
        }
      } else {
        this.unsupportedEntities.add(entity.entity_id);
        this.log.debug(`Entity ${entity.entity_id} is not supported`);
        return;
      }
    }
    await device.updateState(entity);
  }

  override async onShutdown(reason?: string) {
    this.log.info('onShutdown called with reason:', reason ?? 'none');
    if (this.config.unregisterOnShutdown === true) await this.unregisterAllDevices();
  }

  private validateConfig(): void {
    const errors: string[] = [];
    if (!(this.platformConfig.homeAssistantUrl?.startsWith('http') ?? false)) {
      errors.push(
        `Home Assistant URL is not set. It must start with 'http', but was: '${this.platformConfig.homeAssistantUrl}'`,
      );
    }
    if (!this.platformConfig.homeAssistantAccessToken) {
      errors.push('Home Assistant Access Token is not set.');
    }
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  }
}
