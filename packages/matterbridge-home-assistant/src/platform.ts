import { Matterbridge, MatterbridgeDynamicPlatform, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';
import { HomeAssistantClient } from './home-assistant/home-assistant-client.js';
import { PatternMatcher, PatternMatcherConfig } from './util/pattern-matcher.js';
import { HomeAssistantMatterAdapter } from './home-assistant/home-assistant-matter-adapter.js';

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
    this.log.debug('onStart called with reason:', reason ?? 'none');

    const client = await HomeAssistantClient.create(config.homeAssistantUrl, config.homeAssistantAccessToken);
    this.adapter = new HomeAssistantMatterAdapter(
      client,
      this,
      new PatternMatcher(config.homeAssistantClientConfig ?? {}),
    );

    await new Promise<void>((resolve) => {
      const handle = setInterval(() => {
        if (client.isInitialized && this.adapter.isInitialized) {
          clearInterval(handle);
          resolve();
        }
      }, 10);
    });

    this.log.debug('onStart finished');
  }

  override async onShutdown(reason?: string) {
    this.log.debug('onShutdown called with reason:', reason ?? 'none');
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
