import { logger } from '@home-assistant-matter-hub/core';
import type { Matterbridge, PlatformConfig } from 'matterbridge';
import { AnsiLogger, TimestampFormat } from 'matterbridge/logger';
import * as ws from 'ws';

import { NodeAnsiTransport } from './node-ansi-transport.js';
import { HomeAssistantPlatform } from './platform.js';

const wnd = globalThis as Record<string, unknown>;
wnd.WebSocket = ws.WebSocket;

if (!Object.prototype.hasOwnProperty.call(AnsiLogger.prototype, 'setGlobalCallback')) {
  Object.assign(AnsiLogger.prototype, {
    setGlobalCallback: AnsiLogger.setGlobalCallback.bind(AnsiLogger),
    getGlobalCallback: AnsiLogger.getGlobalCallback.bind(AnsiLogger),
  });
  const patchLogger = new AnsiLogger({
    logTimestampFormat: TimestampFormat.TIME_MILLIS,
    logName: 'matterbridge-home-assistant',
  });
  patchLogger.warn('Patched NodeAnsiLogger until this PR is released: https://github.com/Luligu/matterbridge/pull/98');
}

export default function initializePlugin(
  matterbridge: Matterbridge,
  ansiLogger: AnsiLogger,
  platformConfig: PlatformConfig,
): HomeAssistantPlatform {
  logger.add(new NodeAnsiTransport(ansiLogger));
  return new HomeAssistantPlatform(matterbridge, ansiLogger, platformConfig);
}
