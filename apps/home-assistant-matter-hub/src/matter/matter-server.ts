import { DeviceBase, logger } from '@home-assistant-matter-hub/core';
import { MatterBridgeDevice, MatterBridgeRegistry } from '@home-assistant-matter-hub/shared-interfaces';
import { MatterServer as MatterJsServer } from '@project-chip/matter.js';
import { Device } from '@project-chip/matter.js/device';
import { QrCodeSchema } from '@project-chip/matter.js/schema';
import { StorageManager } from '@project-chip/matter.js/storage';

import { BridgeServer } from './bridge-server.js';

export class MatterServer implements MatterBridgeRegistry {
  private readonly log = logger.child({ service: 'MatterServer' });

  private readonly qrCodeSchema = new QrCodeSchema();
  private readonly bridgeServers: BridgeServer[] = [];
  private readonly server: MatterJsServer;

  public get bridges(): MatterBridgeDevice[] {
    return this.bridgeServers.map((it) => it.meta);
  }

  constructor(private readonly storage: StorageManager) {
    DeviceBase.setDeviceConstructor((entity, type) => {
      return new Device(type, { uniqueStorageKey: entity.entity_id });
    });

    this.server = new MatterJsServer(this.storage, {});
  }

  async start() {
    await this.server.start();
  }

  async close() {
    await this.server.close();
  }

  async createBridge(bridge: MatterBridgeDevice): Promise<BridgeServer> {
    const server = new BridgeServer(bridge);
    this.bridgeServers.push(server);
    await this.server.addCommissioningServer(server.commissioningServer);

    const { qrPairingCode, manualPairingCode } = server.commissioningServer.getPairingCode();
    const qrCode = this.qrCodeSchema.encode(qrPairingCode);
    this.log.info(
      [
        `Bridge '${server.meta.name} (${server.meta.id})' started on port ${server.commissioningServer.getPort()}`,
        `Manual Pairing code: ${manualPairingCode}`,
        `Pairing code: ${qrPairingCode}`,
        qrCode,
      ].join('\n'),
    );
    return server;
  }
}
