import type { Matterbridge, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';
import { HomeAssistantPlatform } from './platform';

export default function initializePlugin(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig): HomeAssistantPlatform {
  return new HomeAssistantPlatform(matterbridge, log, config);
}
