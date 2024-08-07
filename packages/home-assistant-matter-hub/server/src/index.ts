#!/usr/bin/env node
import { createWebServer } from './api/webserver.js';
import { DeviceRegistry } from './matter/device-registry.js';

const registry = new DeviceRegistry();
const webserver = createWebServer(registry);

webserver.app.listen(8080, () => console.log('listening on port 8080'));
