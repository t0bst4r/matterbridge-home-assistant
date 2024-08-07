import { DeviceBase } from '@home-assistant-matter-hub/core';
import express from 'express';

import { DeviceRegistry } from '../../matter/device-registry.js';

export class DevicesApi {
  public readonly router = express.Router();

  constructor(private readonly registry: DeviceRegistry) {
    this.router.get('/', this.listDevices.bind(this));
    this.router.get('/:deviceId', this.getDevice.bind(this));
  }

  private listDevices(_: express.Request, res: express.Response) {
    res
      .contentType('application/json')
      .status(200)
      .send(this.registry.devices.map((device) => this.mapDevice(device)));
  }

  private getDevice(req: express.Request, res: express.Response) {
    const { deviceId } = req.params;
    const device = this.registry.devices.find((dev) => dev.entityId === deviceId);
    if (device) {
      res.contentType('application/json').status(200).send(this.mapDevice(device));
    } else {
      res.contentType('text/plain').status(404).send('Not Found');
    }
  }

  private mapDevice(device: DeviceBase): object {
    return {
      entityId: device.entityId,
    };
  }
}
