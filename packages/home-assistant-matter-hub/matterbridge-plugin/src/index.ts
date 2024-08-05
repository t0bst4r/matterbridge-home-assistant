import { logger } from '@home-assistant-matter-hub/core';
import type { Matterbridge, PlatformConfig } from 'matterbridge';
import type { AnsiLogger } from 'matterbridge/logger';
import * as ws from 'ws';

import { NodeAnsiTransport } from './node-ansi-transport.js';
import { HomeAssistantPlatform } from './platform.js';

const wnd = globalThis as Record<string, unknown>;
wnd.WebSocket = ws.WebSocket;

export default function initializePlugin(
  matterbridge: Matterbridge,
  ansiLogger: AnsiLogger,
  platformConfig: PlatformConfig,
): HomeAssistantPlatform {
  logger.add(new NodeAnsiTransport(ansiLogger));
  return new HomeAssistantPlatform(matterbridge, ansiLogger, platformConfig);
}
