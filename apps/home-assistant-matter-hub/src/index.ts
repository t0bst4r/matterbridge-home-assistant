import '@project-chip/matter-node.js';

import { logger } from '@home-assistant-matter-hub/core';
import { Environment } from '@project-chip/matter.js/environment';

import { ConsoleTransport } from './logging/transports.js';
import { StorageManager } from './storage/storage-manager.js';

logger.add(ConsoleTransport);
const log = logger.child({ service: 'home-assistant-matter-hub' });

const environment = Environment.default;
const storage = await StorageManager.create(environment);

log.info('Starting home assistant matter-hub');
log.info('Storage location: %s', storage.location);

const bridges = storage.get().bridges ?? [];
if (bridges.length === 0) {
  bridges.push({
    id: 'Home-Assistant-Matter-Hub',
    name: 'Home-Assistant-Matter-Hub',
    fabrics: [],
  });
  await storage.set({ bridges });
}

log.info('Starting %s bridge(s)', bridges.length);
