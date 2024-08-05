import { MatterConnectorConfig } from '@home-assistant-matter-hub/core';
import JSON5 from 'json5';
import fs from 'node:fs';
import { Logger } from 'winston';

export function parseConfiguration(logger: Logger): Omit<MatterConnectorConfig, 'registry'> {
  const configFile = process.env.MHA_CONFIG_FILE;
  const envConfig = process.env.MHA_CONFIG;

  const log = logger.child({
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

  return {
    ...connectorConfig,
    devices: {
      ...(connectorConfig.devices ?? {}),
      vendorId: connectorConfig.devices?.vendorId ?? 0x0000,
      vendorName: connectorConfig.devices?.vendorName ?? 't0bst4r',
    },
  };
}
