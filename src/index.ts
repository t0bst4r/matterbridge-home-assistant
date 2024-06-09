import type { Matterbridge, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';
import * as ws from 'ws';
import { HomeAssistantClientConfig } from './home-assistant/home-assistant-client.js';
import { HomeAssistantPlatform } from './platform.js';

const homeAssistantUrl = process.env.HOME_ASSISTANT_URL!;
const homeAssistantAccessToken = process.env.HOME_ASSISTANT_ACCESS_TOKEN!;
const homeAssistantClientConfig = JSON.parse(
  process.env.HOME_ASSISTANT_CLIENT_CONFIG ?? '{}',
) as HomeAssistantClientConfig;

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
  });
}
