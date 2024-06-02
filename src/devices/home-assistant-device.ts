import * as crypto from 'crypto';
import { MatterbridgeDevice } from 'matterbridge';

export class HomeAssistantDevice extends MatterbridgeDevice {

  createSerial(entityId: string) {
    return crypto
      .createHash('md5')
      .update(entityId)
      .digest('hex')
      .substring(0, 30);
  }

}