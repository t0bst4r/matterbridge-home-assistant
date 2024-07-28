import { logger, MatterConnectorConfig } from 'home-assistant-matter-hub';
import JSON5 from 'json5';
import type { Matterbridge, PlatformConfig } from 'matterbridge';
import type { AnsiLogger } from 'matterbridge/logger';
import * as fs from 'node:fs';
import * as ws from 'ws';

import { NodeAnsiTransport } from './node-ansi-transport.js';
import { HomeAssistantPlatform } from './platform.js';

const configFile = process.env.MHA_CONFIG_FILE;
const envConfig = process.env.MHA_CONFIG;

const wnd = globalThis as Record<string, unknown>;
wnd.WebSocket = ws.WebSocket;

export default function initializePlugin(
  matterbridge: Matterbridge,
  ansiLogger: AnsiLogger,
  platformConfig: PlatformConfig,
): HomeAssistantPlatform {
  logger.add(new NodeAnsiTransport(ansiLogger));

  const log = logger.child({
    service: 'Matterbridge-Home-Assistant Plugin',
    hint: [
      '',
      'Matterbridge-Home-Assistant has to be configured by a config file or an environment variable.',
      'You can configure the config-file location by setting the MHA_CONFIG_FILE environment variable,',
      'or you can put the whole JSON config into the MHA_CONFIG environment variable.',
      '',
      'This is most probably caused by upgrading from version 1.x to 2.x',
      '',
      'Please see the documentation for further details about the structure of the config file: ',
      'https://github.com/t0bst4r/matterbridge-home-assistant/tree/main/packages/matterbridge-home-assistant#configuration',
      '',
    ].join('\n'),
  });

  let connectorConfig: Omit<MatterConnectorConfig, 'registry'>;

  if (envConfig) {
    try {
      connectorConfig = JSON5.parse(envConfig);
    } catch (e) {
      log.error('Could not JSON.parse the config from environment variable.');
      throw e;
    }
  } else if (configFile) {
    try {
      connectorConfig = JSON5.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (e) {
      log.error(`Could not JSON.parse the config file in ${configFile}`);
      throw e;
    }
  } else {
    log.error('Environment variables MHA_CONFIG_FILE and MHA_CONFIG are not set.');
    throw new Error('Environment variables MHA_CONFIG_FILE and MHA_CONFIG are not set.');
  }

  if (!connectorConfig.homeAssistant) {
    log.error(`Config file ${configFile} does not contain a homeAssistant property.`);
    throw new Error(`Config file ${configFile} does not contain a homeAssistant property.`);
  }

  if (!connectorConfig.homeAssistant.url || !connectorConfig.homeAssistant.accessToken) {
    log.error(`homeAssistant.url or homeAssistant.accessToken not specified in ${configFile}.`);
    throw new Error(`homeAssistant.url or homeAssistant.accessToken not specified in ${configFile}`);
  }

  return new HomeAssistantPlatform(matterbridge, ansiLogger, {
    ...platformConfig,
    connector: connectorConfig,
  });
}
