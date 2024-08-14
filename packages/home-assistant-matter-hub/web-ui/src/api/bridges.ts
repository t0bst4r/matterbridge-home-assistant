import { MatterBridgeDevice } from '@home-assistant-matter-hub/shared-interfaces';
import { useMemo } from 'react';

import { RequestResponse } from './request.ts';

const bridges: MatterBridgeDevice[] = [
  {
    id: 'Main Bridge',
    name: 'Matterbridge aggregator',
    manualPairingCode: 'abc',
    qrPairingCode: '123',
    fabrics: [
      {
        id: 'Alexa-1',
        name: 'Alexa',
        activeSessions: 1,
      },
      {
        id: 'Google-1',
        name: 'Google',
        activeSessions: 2,
      },
      {
        id: 'Apple-1',
        name: 'Apple',
        activeSessions: 3,
      },
    ],
  },
];

export function useBridges(): RequestResponse<MatterBridgeDevice[]> {
  return [false, bridges, undefined];
}

export function useBridge(): RequestResponse<MatterBridgeDevice> {
  const [loading, bridges, error] = useBridges();
  return useMemo<RequestResponse<MatterBridgeDevice>>(() => [loading, bridges?.[0], error], [loading, bridges, error]);
}
