import { RequestResponse } from './request.ts';

import { MatterDevice } from '../../../shared-interfaces/src/models';

const allDevices: MatterDevice[] = [
  {
    domain: 'light',
    entityId: 'light.schreibtisch',
    deviceType: 'MA-dimmablelight (0x0101)',
    friendlyName: 'Schreibtisch',
    currentState: {
      onOff: { state: 'On' },
      levelControl: {
        brightness: 0.8,
      },
    },
  },
  {
    domain: 'light',
    entityId: 'light.schreibtisch_toby',
    deviceType: 'MA-simplelight',
    friendlyName: 'Schreibtisch Toby',
    currentState: {
      onOff: { state: 'On' },
    },
  },
];

export function useDevices(): RequestResponse<MatterDevice[]> {
  return [false, allDevices, undefined];
}
