import { MatterDevice } from '@home-assistant-matter-hub/shared-models';

import { RequestResponse } from './request.ts';

const allDevices: MatterDevice[] = [
  {
    domain: 'light',
    entityId: 'light.schreibtisch',
    deviceType: 'MA-dimmablelight (0x0101)',
    friendlyName: 'Schreibtisch',
    registered: true,
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
    friendlyName: 'Schreibtisch Toby',
    registered: false,
    comments: ['not included'],
  },
  {
    domain: 'light',
    entityId: 'light.schreibtisch_saskia',
    friendlyName: 'Schreibtisch Saskia',
    registered: false,
    comments: ['not included'],
  },
];

export function useDevices(): RequestResponse<MatterDevice[]> {
  return [false, allDevices, undefined];
}
