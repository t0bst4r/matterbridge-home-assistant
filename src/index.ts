import type { Matterbridge, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';
import * as ws from 'ws';
import { HomeAssistantPlatform } from './platform.js';
import { PatternMatcherConfig } from './util/pattern-matcher.js';

const homeAssistantUrl = process.env.HOME_ASSISTANT_URL!;
const homeAssistantAccessToken = process.env.HOME_ASSISTANT_ACCESS_TOKEN!;
const homeAssistantClientConfig = JSON.parse(process.env.HOME_ASSISTANT_CLIENT_CONFIG ?? '{}') as PatternMatcherConfig;
const enableMockDevices = process.env.ENABLE_MOCK_DEVICES === 'true';

const wnd = globalThis as Record<string, unknown>;
wnd.WebSocket = ws.WebSocket;

export default function initializePlugin(
  matterbridge: Matterbridge,
  log: AnsiLogger,
  config: PlatformConfig,
): HomeAssistantPlatform {
  return new HomeAssistantPlatform(matterbridge, log, {
    ...config,
    homeAssistantUrl,
    homeAssistantAccessToken,
    homeAssistantClientConfig,
    enableMockDevices,
  });
}
