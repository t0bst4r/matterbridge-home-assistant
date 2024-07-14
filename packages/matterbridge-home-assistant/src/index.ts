import type { PatternMatcherConfig } from 'home-assistant-matter-hub';
import type { Matterbridge, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';
import * as ws from 'ws';

import { HomeAssistantPlatform } from './platform.js';

const homeAssistantUrl = process.env.HOME_ASSISTANT_URL!;
const homeAssistantAccessToken = process.env.HOME_ASSISTANT_ACCESS_TOKEN!;
const patternMatcherConfig = JSON.parse(process.env.HOME_ASSISTANT_CLIENT_CONFIG ?? '{}') as PatternMatcherConfig;

const wnd = globalThis as Record<string, unknown>;
wnd.WebSocket = ws.WebSocket;

export default function initializePlugin(
  matterbridge: Matterbridge,
  log: AnsiLogger,
  config: PlatformConfig,
): HomeAssistantPlatform {
  return new HomeAssistantPlatform(matterbridge, log, {
    ...config,
    connector: {
      homeAssistant: {
        url: homeAssistantUrl,
        accessToken: homeAssistantAccessToken,
        matcher: patternMatcherConfig,
      },
    },
  });
}
