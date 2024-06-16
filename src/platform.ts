import { Matterbridge, MatterbridgeDynamicPlatform, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';
import { HomeAssistantClient } from './home-assistant/home-assistant-client.js';
import { lightMocks } from './mocks/light-mocks.js';
import { PatternMatcher, PatternMatcherConfig } from './util/pattern-matcher.js';
import { HomeAssistantMatterAdapter } from './home-assistant/home-assistant-matter-adapter.js';
import { switchMocks } from './mocks/switch-mocks.js';

export interface HomeAssistantPlatformConfig extends PlatformConfig {
  homeAssistantUrl: string;
  homeAssistantAccessToken: string;
  homeAssistantClientConfig?: PatternMatcherConfig;
  enableMockDevices?: boolean;
}

export class HomeAssistantPlatform extends MatterbridgeDynamicPlatform {
  private adapter!: HomeAssistantMatterAdapter;

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
    this.adapter = new HomeAssistantMatterAdapter(
      client,
      this,
      new PatternMatcher(config.homeAssistantClientConfig ?? {}),
    );

    if (config.enableMockDevices) {
      await this.adapter.create(lightMocks.withBrightness(1));
      await this.adapter.create(lightMocks.withHsl(2));
      await this.adapter.create(lightMocks.withRgb(3));
      await this.adapter.create(lightMocks.withXY(4));
      await this.adapter.create(lightMocks.withTemperature(5));
      await this.adapter.create(switchMocks.onOff(6));
    }
  }

  override async onShutdown(reason?: string) {
    this.log.info('onShutdown called with reason:', reason ?? 'none');
    this.adapter.close();
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
