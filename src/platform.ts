import { Matterbridge, MatterbridgeDevice, MatterbridgeDynamicPlatform, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';
import { LightDevice } from './devices/light-device.js';

export class HomeAssistantPlatform extends MatterbridgeDynamicPlatform {

  private light: MatterbridgeDevice | undefined;

  constructor(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig) {
    super(matterbridge, log, config);
  }

  override async onStart(reason?: string) {
    this.log.info('onStart called with reason:', reason ?? 'none');

    this.light = new LightDevice('Light 1', 'light.couch');
    await this.registerDevice(this.light);
  }

  override async onShutdown(reason?: string) {
    this.log.info('onShutdown called with reason:', reason ?? 'none');
    if (this.config.unregisterOnShutdown === true) await this.unregisterAllDevices();
  }
}
