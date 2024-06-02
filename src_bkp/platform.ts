import { Matterbridge, MatterbridgeDevice, MatterbridgeDynamicPlatform, PlatformConfig, DeviceTypes } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';

export class HomeAssistantPlatform extends MatterbridgeDynamicPlatform {

  private light: MatterbridgeDevice | undefined;

  constructor(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig) {
    super(matterbridge, log, config);
  }

  override async onStart(reason?: string) {
    this.log.info('onStart called with reason:', reason ?? 'none');


  }

}
