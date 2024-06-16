import { UnsubscribeFunc } from 'home-assistant-js-websocket';
import { Matterbridge, MatterbridgeDynamicPlatform, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';
import { HomeAssistantClient } from './home-assistant/home-assistant-client.js';
import { lightMocks } from './mocks/light-mocks.js';
import { PatternMatcherConfig } from './util/pattern-matcher.js';
import { HomeAssistantMatterAdapter } from './home-assistant/home-assistant-matter-adapter.js';

export interface HomeAssistantPlatformConfig extends PlatformConfig {
  homeAssistantUrl: string;
  homeAssistantAccessToken: string;
  homeAssistantClientConfig?: PatternMatcherConfig;
  enableMockDevices?: boolean;
}

export class HomeAssistantPlatform extends MatterbridgeDynamicPlatform {
  private unsubscribe!: UnsubscribeFunc;

  constructor(
    matterbridge: Matterbridge,
    log: AnsiLogger,
    private readonly platformConfig: HomeAssistantPlatformConfig,
  ) {
    super(matterbridge, log, platformConfig);
    log.setLogName('HomeAssistantPlatform');
  }

  override async onStart(reason?: string) {
    const config = this.validateConfig();
    this.log.info('onStart called with reason:', reason ?? 'none');

    const client = await HomeAssistantClient.create(config.homeAssistantUrl, config.homeAssistantAccessToken);
    const adapter = new HomeAssistantMatterAdapter(this.log, client, this);
    this.unsubscribe = client.subscribe(adapter);

    if (config.enableMockDevices) {
      await adapter.onCreate(lightMocks.withBrightness(1));
      await adapter.onCreate(lightMocks.withHsl(2));
      await adapter.onCreate(lightMocks.withRgb(3));
      await adapter.onCreate(lightMocks.withXY(4));
      await adapter.onCreate(lightMocks.withTemperature(5));
    }
  }

  override async onShutdown(reason?: string) {
    this.log.info('onShutdown called with reason:', reason ?? 'none');
    this.unsubscribe();
    if (this.config.unregisterOnShutdown === true) await this.unregisterAllDevices();
  }

  private validateConfig(): HomeAssistantPlatformConfig {
    const errors: string[] = [];
    const config = this.platformConfig;
    if (!(config.homeAssistantUrl?.startsWith('http') ?? false)) {
      errors.push(`Home Assistant URL is not set. It must start with 'http', but was: '${config.homeAssistantUrl}'`);
    }
    if (!config.homeAssistantAccessToken) {
      errors.push('Home Assistant Access Token is not set.');
    }
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
    return config;
  }
}
